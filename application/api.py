import re, sys, jwt, datetime
from flask_restful import Resource, fields, marshal_with, reqparse
from datetime import timedelta, datetime
from application.database import db
from application.models import User, Album, Creator, Genre, Playlist, Role, Playlist_content, Song, Pending_collabs, Playlist_history, Song_history, Sqlite_sequence
from application.validation import NotFoundError, Error
from app import hashing
from flask import current_app as app
from flask import Flask, jsonify, session, request
from sqlalchemy import select, update, delete, values, func, exc, text, or_, and_
import json
from statistics import mean
import os
import pandas as pd
import matplotlib.pyplot as plt
import redis

redis_client = redis.StrictRedis(host='localhost', port=6379, db=0, decode_responses=True)

@app.route('/api/redis/set/<key>', methods=['POST'])
def set_dictionary_in_redis(key):
    dictionary = request.json
    print(dictionary)
    redis_client.hmset(key, dictionary)
    return jsonify({'message': 'Dictionary set in Redis'}), 200

# Endpoint for retrieving data from Redis
@app.route('/api/redis/get/<key>', methods=['GET'])
def get_from_redis(key):
    value = redis_client.hgetall(key)
    if value:
        return jsonify({'status_code': 409, 'data': value})
    else:
        return jsonify({'error': 'Key not found in Redis'})

@app.route('/api/redis/delete/<key>', methods=['POST'])
def delete_redis_data(key):
    redis_client.delete(key)
    return jsonify({'message': f'Data with key {key} deleted from Redis'})

class UserLoginAPI(Resource):
	def post(self):
		data = request.json
		username = data.get('username')
		password = data.get('password')

		if username is None:
			return jsonify({'status_code': 409, 'message':'Username is required'})

		if password is None:
			raise jsonify({'status_code': 409, 'message':'Password is required'})

		#Get the User from database based on username or email
		user = db.session.query(User).filter(User.username==username).first()
		if not user:
			user = db.session.query(User).filter(User.email==username).first()

		if user is not None:
			if hashing.check_value(user.password, password, salt='abcd'):
				token = jwt.encode({'user_id': user.id}, app.config['SECRET_KEY'], algorithm='HS256')
				role = user.roles
				role = (str(role))[7]
				role = db.session.query(Role).with_entities(Role.name).filter(Role.id==role).first()[0]
				update = User.query.filter_by(id=user.id).first()
				update.active = True
				db.session.commit()

				session['token'] = token
				session['role'] = role
				return jsonify({'user_id': user.id, 'token': token, 'role': role, 'status_code': 200, 'message':'Login Successful'})
			else:
				return jsonify({'status_code': 401, 'message':'Incorrect Password'})

		else:
			#Return error if user does not exist
			return jsonify({'status_code': 401, 'message':"Wrong Account Details"})

class UserSignupAPI(Resource):
	def get(self):
		user_id = request.args.get('user_id')
		token = request.args.get('token')

		if (session.get("role") == 'User' or session.get('role') == 'Creator') and token == session.get('token'):
			playlists = db.session.query(Playlist).filter(Playlist.user_id==user_id)
			playlists_data = []
			for playlist in playlists:
				playlist_dict = {"playlist_id": playlist.playlist_id, "playlist_name": playlist.playlist_name}
				try:
					album_id = (db.session.query(Playlist_content, Album, Song).with_entities(Album.album_id).filter(Playlist_content.playlist_id==playlist.playlist_id, Playlist_content.song_id==Song.song_id, Song.album_id==Album.album_id).first()).album_id
				except:
					album_id = "default"
				playlist_dict["album_id"] = album_id
				playlists_data.append(playlist_dict)

			user = User.query.get(user_id)
			user = {"user_id": user.id, "name": user.name}

			flag = User.query.get(user_id).view_flagged

			return jsonify({"status_code": 200, "message": "Retrieval Successful", "flag":flag, "playlists": playlists_data, "user": user})

		else:
			return jsonify({'status_code':401, 'message':"Unauthorized Access"})

	def post(self):
		data = request.json
		username = data.get('username')
		password = data.get('password')
		name = data.get('name')
		email = data.get('email')
		phone = data.get('phone')

		#Error codes for missing fields
		if username is None:
			return jsonify({'status_code': 409, 'message':'Username is required'})

		if password is None:
			raise jsonify({'status_code': 409, 'message':'Password is required'})
			
		if name is None:
			return jsonify({'status_code': 409, 'message':'Name is required'})

		if email is None:
			raise jsonify({'status_code': 409, 'message':'Email is required'})

		if phone is None:
			return jsonify({'status_code': 409, 'message':'Phone Number is required'})

		#Check if username already exists in database
		user = db.session.query(User).filter(User.username==username).first()
		if not user:
			#Check if email is taken
			user = db.session.query(User).filter(User.email==email).first()
			if not user:
				#Check if phone number is taken
				user = db.session.query(User).filter(User.phone==phone).first()
				if not user:
					#Hash password
					password = hashing.hash_value(password, salt='abcd')

					#Create the user object
					user = User(name=name, username=username, password=password, email=email, phone=phone)

					#Get the user role object
					role = db.session.query(Role).filter(Role.id==2).first()
					#Add the user object to database
					user.roles.append(role)
					db.session.add(user)
					db.session.commit()
					#Create auth token
					token = jwt.encode({'user_id': user.id}, app.config['SECRET_KEY'], algorithm='HS256')

					update = User.query.filter_by(username=username).first()
					update.active = True
					db.session.commit()

					session['token'] = token
					session['role'] = 'User'

					return jsonify({'user_id': user.id, 'token': token, 'role': 'User', 'status_code': 200, 'message':'Signup Successful'})

				else:
					#Return error if phone number is taken
					return jsonify({'status_code': 409, 'message':"Phone number taken"})

			else:
				#Return error if email is taken
				return jsonify({'status_code': 409, 'message':"Email taken"})

		else:
			#Return error if user already exists
			return jsonify({'status_code': 409, 'message':"Username taken"})

#Updated
class AdminLoginAPI(Resource):
	def post(self):
		data = request.json
		username = data.get('username')
		password = data.get('password')

		if username is None:
			return jsonify({'status_code': 409, 'message':'Username is required'})

		if password is None:
			raise jsonify({'status_code': 409, 'message':'Password is required'})

		#Get the Admin from database based on username or email
		user = db.session.query(User).filter(User.username==username).first()
		if not user:
			user = db.session.query(User).filter(User.email==username).first()

		if user is not None:
			if hashing.check_value(user.password, password, salt='abcd'):
				token = jwt.encode({'user_id': user.id}, app.config['SECRET_KEY'], algorithm='HS256')
				#login_role = 'Admin'
				role = user.roles
				role = (str(role))[7]
				role = db.session.query(Role).with_entities(Role.name).filter(Role.id==role).first()[0]

				session['token'] = token
				session['role'] = role
				#if login_role != role:
					#return jsonify({'user_id': user.id, 'token': token, 'role': role, 'status_code': 401, 'message':'Unauthorized'})
				return jsonify({'user_id': user.id, 'token': token, 'role': role, 'status_code': 200, 'message':'Login Successful'})
			else:
				return jsonify({'status_code': 401, 'message':'Incorrect Password'})

		else:
			#Return error if user does not exist
			return jsonify({'status_code': 401, 'message':"Wrong Account Details"})

#Updated
class CreatorLoginAPI(Resource):
	def post(self):
		data = request.json
		username = data.get('username')
		password = data.get('password')

		if username is None:
			return jsonify({'status_code': 409, 'message':'Username is required'})

		if password is None:
			raise jsonify({'status_code': 409, 'message':'Password is required'})

		#Get the Creator from database based on username or email
		user = db.session.query(User).filter(User.username==username).first()
		if not user:
			user = db.session.query(User).filter(User.email==username).first()

		creator = db.session.query(Creator).filter(Creator.user_id==user.id).first()

		if user is not None:
			if hashing.check_value(user.password, password, salt='abcd'):
				token = jwt.encode({'user_id': user.id}, app.config['SECRET_KEY'], algorithm='HS256')
				role = user.roles
				role = (str(role))[7]
				role = db.session.query(Role).with_entities(Role.name).filter(Role.id==role).first()[0]

				session['token'] = token
				session['role'] = role

				if not creator:
					return jsonify({'user_id': user.id, 'token': token, 'role': role, 'status_code': 200, 'message':'Unauthorized Access'})
				else:
					return jsonify({'creator_id': creator.creator_id, 'user_id': user.id, 'token': token, 'role': role, 'status_code': 200, 'message':'Login Successful'})
			else:
				return jsonify({'status_code': 401, 'message':'Incorrect Password'})

		else:
			#Return error if user does not exist
			return jsonify({'status_code': 401, 'message':"Wrong Account Details"})

class CreatorSignupAPI(Resource):
	#Updated
	def get(self):
		creator_id = request.args.get('creator_id')
		user_id = request.args.get('user_id')
		creator_id = db.session.query(Creator).filter(Creator.user_id==user_id).first().creator_id
		print(creator_id)
		creator = Creator.query.get(creator_id)
		creator_dict = {"creator_id":creator_id, "user_id":creator.user_id, "creator_name":creator.creator_name}
		creator_profile = creator.profile
		token = request.args.get('token')

		if session.get("role") == 'Creator' and token == session.get('token'):
			if creator_profile:
				creator_profile = creator_profile.replace("C:/music_streaming_app/static/images", "../static/creator_profiles")
			if not creator.profile:
				creator_profile = "../creator_profiles/default.jpeg"

			songs = db.session.query(Song, Album).with_entities(Song.plays, Song.song_id).filter(or_(and_(Album.creator_id==creator_id, Song.album_id==Album.album_id), Song.collaborator_1==creator_id,Song.collaborator_2==creator_id, Song.collaborator_3==creator_id,Song.collaborator_4==creator_id))
			top_songs = db.session.query(Song, Album).with_entities(Song.song_id, Song.song_name, Song.plays, Song.duration, Album.album_id).filter(or_(and_(Album.creator_id==creator_id, Song.album_id==Album.album_id), Song.collaborator_1==creator_id, Song.collaborator_2==creator_id, Song.collaborator_3==creator_id,Song.collaborator_4==creator_id)).order_by(Song.plays.desc()).limit(5)

			if top_songs is not None:
				songs_data = []
				for song in top_songs.all():
					song_dict = {
				        "song_id": song.song_id,
				        "song_name": song.song_name,
				        "album_id": song.album_id,
				        "plays": song.plays,
				    }

					temp = db.session.query(Creator, Album).filter(Creator.creator_id==Album.creator_id, Album.album_id==song.album_id)
					song_dict["album_name"] = (temp.first()[1]).album_name
					song_dict["creator_name"] = (temp.first()[0]).creator_name
					song_dict["creator_id"] = (temp.first()[0]).creator_id
					song_dict["playlist_id"] = (temp.first()[1]).playlist_id

					for i in range(1,5):
						c = "collaborator_" + str(i)
						c_id = c+"_id"
						temp = db.session.query(Song, Creator, Album).filter(Creator.creator_id==getattr(Song, c), Album.album_id==Song.album_id, Song.song_id == song.song_id)
						if temp.first():
							song_dict[c] = (temp.first()[1]).creator_name
							song_dict[c_id] = (temp.first()[1]).creator_id
				    
					songs_data.append(song_dict)

			plays=0

			for song in songs.all():
				if song.plays != None:
					plays += song.plays

			playlists = db.session.query(Playlist, Album).with_entities(Playlist.playlist_id, Playlist.playlist_name).filter(Playlist.user_id==user_id, Album.playlist_id!=Playlist.playlist_id).distinct()
			playlists_data = []

			for playlist in playlists:
				playlist_dict = {"playlist_id":playlist.playlist_id, "playlist_name":playlist.playlist_name}
				playlists_data.append(playlist_dict)

			if user_id:
				flag = User.query.get(user_id).view_flagged
			else:
				flag = None

			return jsonify({"status_code": 200, "message":'Retrieval Successful', "flag":flag, "creator":creator_dict, "creator_profile":creator_profile, "plays":plays, "songs":songs_data, "playlists":playlists_data})

		else:
			return jsonify({'status_code':401, 'message':"Unauthorized Access"})

	#Updated
	def post(self):
		profile = request.files['profile']
		user_id = request.form['user_id']
		creator_name = request.form['creator_name']
		password = request.form['password']
		token = request.form['token']

		if session.get("role") == 'User' and token == session.get('token'):
			if creator_name is None:
				return jsonify({'status_code': 409, 'message':'Creator Name is required'})

			if password is None:
				raise jsonify({'status_code': 409, 'message':'Password is required'})

			#Get the User from database based on username or email
			user = db.session.query(User).filter(User.id==user_id).first()

			if user is not None:
				if hashing.check_value(user.password, password, salt='abcd'):
					role = user.roles
					role = (str(role))[7]
					role = db.session.query(Role).with_entities(Role.name).filter(Role.id==role).first()[0]
					if role == 'User':
						old_role = db.session.query(Role).filter(Role.id==2).first()
						new_role = db.session.query(Role).filter(Role.id==3).first()

						#Save the image
						seq = Sqlite_sequence.query.get("creator").seq
						filename = str(seq+1) + ".jpeg"
						if profile:
							path = f"static/creator_profiles/{filename}"
							profile.save(path)

						#Add the user object to database
						user.roles.remove(old_role)
						user.roles.append(new_role)
						db.session.add(user)

						#Create the creator object
						creator = Creator(creator_name=creator_name, user_id=user_id, profile=path)
						db.session.add(creator)
						db.session.commit()

						role = 'Creator'

						return jsonify({'creator_id': creator.creator_id, 'role': role, 'status_code': 200, 'message':'Signup Successful'})
					else:
						return jsonify({'status_code':401, 'message':'Already Logged In'})
				else:
					return jsonify({'status_code': 401, 'message':'Incorrect Password'})
		else:
			return jsonify({'status_code':401, 'message':"Unauthorized Access"})

	#Not Updated
	def put(self):
		token = request.args.get('token')
		if session.get("role") == 'Creator' and token == session.get('token'):
			creator_name = request.form['creator_name']
			creator_id = request.form['creator_id']
			
			old_profile = Creator.query.get(creator_id)
			filename = str(creator_id) + ".jpeg"
			path = f"static/images/{filename}"
			try:
				profile = request.files['profile']
				try:
					os.remove(path)
				except:
					pass
				profile.save(path)
			except:
				profile = old_profile.profile
				os.rename(old_profile.profile, path, src_dir_fd=None, dst_dir_fd=None)	

			u = update(Creator)
			u = u.values({"creator_name":creator_name, "profile":path})
			u = u.where(Creator.creator_id == creator_id)
			db.session.execute(u)
			db.session.commit()

			return jsonify({'status_code':200, 'message':'Profile Update Successful'})
		else:
			return jsonify({'status_code':401, 'message':"Unauthorized Access"})

#Updated
class CreatorHomeAPI(Resource):
	def get(self):
		user_id = request.args.get('user_id')
		role = request.args.get('role')
		token = request.args.get('token')

		if (session.get("role") == 'Creator' or session.get("role") == 'Admin') and token == session.get('token'):
			if user_id == None and role == None:
				songs = Song.query.all()
				songs_data = []
				for song in songs:
					song_dict = {"song_id": song.song_id,"song_name": song.song_name,"album_id": song.album_id,"lyrics": song.lyrics, "flag": song.flag}
					songs_data.append(song_dict)
				
				return jsonify({'status_code': 200, 'message': 'Retrieval Successful', 'songs':songs_data})

			else:
				creator_id = db.session.query(Creator).with_entities(Creator.creator_id).filter(Creator.user_id==user_id).first()[0]
				albums_1 = db.session.query(Song, Album).add_columns(Song.song_id).filter(Album.creator_id==creator_id)
				albums_2 = db.session.query(Song).with_entities(Song.song_id).filter(or_(Song.collaborator_1==creator_id, Song.collaborator_2==creator_id, Song.collaborator_3==creator_id, Song.collaborator_4==creator_id))

				if not (albums_1.first() or albums_2.first()):
					return jsonify({'status_code': 200, 'message': 'No Albums'})
				else:
					songs_1 = db.session.query(Song, Album).add_columns(Song.song_name, Song.song_id, Song.lyrics, Song.album_id).filter(Album.creator_id==creator_id, Song.album_id==Album.album_id)
					songs_2 = db.session.query(Song).filter(or_(Song.collaborator_1==creator_id,Song.collaborator_2==creator_id, Song.collaborator_3==creator_id,Song.collaborator_4==creator_id))
					avg_rating_1=db.session.query(Song, Album).with_entities(func.avg(Song.rating).label('average')).filter(Album.creator_id==creator_id, Song.album_id==Album.album_id).first()[0]
					avg_rating_2=db.session.query(Song, Album).with_entities(func.avg(Song.rating).label('average')).filter(or_(Song.collaborator_1==creator_id, Song.album_id==Album.album_id, Song.collaborator_2==creator_id, Song.album_id==Album.album_id, Song.collaborator_3==creator_id, Song.album_id==Album.album_id, Song.collaborator_4==creator_id, Song.album_id==Album.album_id)).first()[0]

					nums=[]

					total_albums = db.session.query(Album).filter(Album.creator_id==creator_id).count()
					total_songs=songs_1.count()+songs_2.count()

					for i in [avg_rating_1, avg_rating_2]:
						if i != None:
							nums.append(i)

					if nums != []:
						avg_rating=mean(nums)

					if 'avg_rating' not in locals():
						avg_rating = "-"

					if songs_1 is not None:
						for song in songs_1.all():
							#song = song.first()[0]
							curr = db.session.query(Song).filter(Song.song_id==song.song_id).first()
							if (not curr.collaborator_1) and curr.collaborator_4:
								u = update(Song)
								u = u.values({"collaborator_1":collaborator_4, "collaborator_4":None})
								u = u.where(Song.song_id == curr.song_id)
								db.session.execute(u)

							if (not curr.collaborator_1) and curr.collaborator_3:
								u = update(Song)
								u = u.values({"collaborator_1":curr.collaborator_3, "collaborator_3":None})
								u = u.where(Song.song_id == curr.song_id)
								db.session.execute(u)

							if (not curr.collaborator_1) and curr.collaborator_2:
								u = update(Song)
								u = u.values({"collaborator_1":curr.collaborator_2, "collaborator_2":None})
								u = u.where(Song.song_id == curr.song_id)
								db.session.execute(u)

							if (not curr.collaborator_2) and curr.collaborator_4:
								u = update(Song)
								u = u.values({"collaborator_2":curr.collaborator_4, "collaborator_4":None})
								u = u.where(Song.song_id == curr.song_id)
								db.session.execute(u)

							if (not curr.collaborator_2) and curr.collaborator_3:
								u = update(Song)
								u = u.values({"collaborator_2":curr.collaborator_3, "collaborator_3":None})
								u = u.where(Song.song_id == curr.song_id)
								db.session.execute(u)

							if (not curr.collaborator_3) and curr.collaborator_4:
								u = update(Song)
								u = u.values({"collaborator_3":curr.collaborator_4, "collaborator_4":None})
								u = u.where(Song.song_id == curr.song_id)
								db.session.execute(u)

							db.session.commit()

					if songs_1 is not None:
						songs_1_data = []
						for song in songs_1.all():
						    song_dict = {
						        "song_id": song.song_id,
						        "song_name": song.song_name,
						        "album_id": song.album_id,
						        "lyrics": song.lyrics
						    }
						    songs_1_data.append(song_dict)

					if songs_2 is not None:
						songs_2_data = []
						for song in songs_2.all():
						    song_dict = {
						        "song_id": song.song_id,
						        "song_name": song.song_name,
						        "album": song.album_id,
						        "lyrics": song.lyrics
						    }
						    songs_2_data.append(song_dict)
					return jsonify({'status_code':200, 'message':'Retrieval Successful', "total_songs":total_songs, "avg_rating":avg_rating, "total_albums":total_albums, "songs_1":songs_1_data, "songs_2":songs_2_data})

		else:
			return jsonify({'status_code':401, 'message':"Unauthorized Access"})

class CreateAlbumAPI(Resource):
	#Updated
	def get(self):
		creator_id = request.args.get('creator_id')
		albums = db.session.query(Album).filter(Album.creator_id==creator_id)
		album_id = request.args.get('album_id')
		token = request.args.get('token')

		if (session.get("role") == 'Creator' or session.get("role") == 'Admin') and token == session.get('token'):
			if not creator_id and not album_id:
				albums = Album.query.all()
				albums_data = []
				for album in albums:
				    album_dict = {
				        "album_id": album.album_id,
				        "album_name": album.album_name
				    }
				    albums_data.append(album_dict)

				return jsonify({'status_code':200, 'message':'Retrieval Successful', 'albums':albums_data})

			try:
				album = Album.query.get(album_id)
				album_dict = {"album_id": album.album_id,"album_name": album.album_name, "language": album.language}
				return jsonify({'status_code': 200, 'message': 'No Albums', 'album':album_dict})
			except:	
				try:
					albums_data = []
					for album in albums.all():
					    album_dict = {
					        "album_id": album.album_id,
					        "album_name": album.album_name
					    }
					    albums_data.append(album_dict)
				except:
					pass
				if albums_data == []:
					return jsonify({'status_code': 200, 'message': 'No Albums'})
				return jsonify({'status_code':200, 'message':'Retrieval Successful', 'albums':albums_data})

		else:
			return jsonify({'status_code':401, 'message':"Unauthorized Access"})

	#Updated
	def post(self):
		image = request.files['image']
		creator_id = request.form['creator_id']
		album_name = request.form['album_name']
		language = request.form['language']
		user_id = request.form['user_id']
		token = request.form['token']

		if session.get("role") == 'Creator' and token == session.get('token'):
			album = db.session.query(Album).filter(and_(Album.album_name==album_name, Album.creator_id==creator_id)).first()

			if album is not None:
				return jsonify({'status_code':401, 'message':'Album Present'})

			#Save the album cover
			image = request.files['image']
			seq = Sqlite_sequence.query.get("album").seq
			filename = str(seq+1) + ".jpeg"
			path = f"static/images/{filename}"
			image.save(path)

			#Create the playlist object
			playlist = Playlist(user_id=user_id, playlist_name=album_name)
			db.session.add(playlist)
			db.session.commit()

			#Get the playlist_id
			playlist = db.session.query(Playlist).order_by(Playlist.playlist_id.desc()).limit(1)[0]

			#Create the album object
			album = Album(creator_id=creator_id, album_name=album_name, album_image=path, language=language, playlist_id=playlist.playlist_id)
			db.session.add(album)
			db.session.commit()

			return jsonify({'status_code':200, 'message':'Album Creation Successful'})
		else:
			return jsonify({'status_code':401, 'message':"Unauthorized Access"})

	#Updated
	def put(self):
		creator_id = request.form['creator_id']
		album_name = request.form['album_name']
		language = request.form['language']
		user_id = request.form['user_id']
		album_id = request.form['album_id']
		token = request.form['token']

		if session.get("role") == 'Creator' and token == session.get('token'):
			old_album = Album.query.get(album_id)
			filename = str(album_id) + ".jpeg"
			path = f"static/images/{filename}"
			try:
				album_image = request.files['album_image']
				try:
					os.remove(path)
				except:
					pass
				album_image.save(path)
				album_image = path
			except:
				album_image = old_album.album_image
				os.rename(old_album.album_image, path, src_dir_fd=None, dst_dir_fd=None)	
			
			album = db.session.query(Album).filter(and_(Album.album_name==album_name, Album.creator_id==creator_id, Album.album_id!=album_id)).first()

			if album is not None:
				return jsonify({'status_code':401, 'message':'Album Present'})

			u = update(Album)
			u = u.values({"album_name":album_name, "album_image":album_image, "language":language, "playlist_id":old_album.playlist_id})
			u = u.where(Album.album_id == album_id)
			db.session.execute(u)
			db.session.commit()

			return jsonify({'status_code': 200, 'message': 'Album Updated'})
		else:
			return jsonify({'status_code':401, 'message':"Unauthorized Access"})

	#Updated
	def delete(self):
		album_id = request.args.get('album_id')
		token = request.args.get('token')

		if (session.get("role") == 'Creator' or session.get("role") == 'Admin') and token == session.get('token'):
			if album_id is None:
				return jsonify({'status_code': 409, 'message':'Album ID is required'})

			if not Album.query.get(album_id):
				return jsonify({'status_code': 401, 'message':'Album not found'})

			album = Album.query.get(album_id)

			playlist = Playlist.query.filter(Playlist.playlist_id==album.playlist_id).delete()

			songs = Song.query.filter(Song.album_id==album_id).delete()

			album = Album.query.filter(Album.album_id==album_id).delete()
			db.session.commit()
			
			return jsonify({'status_code':200, 'message':'Album Deleted'})
		else:
			return jsonify({'status_code':401, 'message':"Unauthorized Access"})

class UploadSongAPI(Resource):
	#Updated
	def get(self):
		creator_id = request.args.get('creator_id')
		song_id = request.args.get('song_id')
		token = request.args.get('token')

		if (session.get("role") == 'Creator' or session.get("role") == 'Admin') and token == session.get('token'):	
			creators = db.session.query(Creator).filter(Creator.creator_id!=creator_id).all()
			count = db.session.query(Creator).filter(Creator.creator_id!=creator_id).count()
			albums = db.session.query(Album).filter(Album.creator_id==creator_id).all()
			genres = db.session.query(Genre).all()

			albums_data = []
			for album in albums:
			    album_dict = {
			        "album_id": album.album_id,
			        "album_name": album.album_name
			    }
			    albums_data.append(album_dict)

			if albums_data == []:
				return jsonify({'status_code': 200, 'message': 'No Albums'})

			creators_data = []
			for creator in creators:
			    creator_dict = {
			        "creator_id": creator.creator_id,
			        "creator_name": creator.creator_name
			    }
			    creators_data.append(creator_dict)

			genres_data = []
			for genre in genres:
				genre_dict = {"genre_id": genre.genre_id,"genre_name": genre.genre_name}
				genres_data.append(genre_dict)

			try:
				song = Song.query.get(song_id)
				song_dict = {"song_id": song.song_id, "song_name": song.song_name, "album_id": song.album_id, "lyrics": song.album_id, "lyrics":song.lyrics, "genre":song.genre, "collaborator_1": song.collaborator_1, "collaborator_2": song.collaborator_2, "collaborator_3": song.collaborator_3, "collaborator_4":song.collaborator_4}

				test_str=(song.duration).replace("m ","*")
				test_str=test_str.replace("s","*")
				re=test_str.split("*")
				seconds=re[1]
				minutes = (song.duration)[:1]

				collab_count=0
				for i in [song.collaborator_1, song.collaborator_2, song.collaborator_3, song.collaborator_4]:
					if i != None:
						collab_count+=1

				return jsonify({"status_code": 200, "message": "Retrieval Successful", "creators":creators_data, "count":count, "albums":albums_data, "genres":genres_data, "curr_song": song_dict, "seconds":seconds, "minutes":minutes, "collab_count":collab_count})

			except:
				return jsonify({"status_code": 200, "message": "Retrieval Successful", "creators":creators_data, "count":count, "albums":albums_data, "genres":genres_data})
		else:
			return jsonify({'status_code':401, 'message':"Unauthorized Access"})

	#Updated
	def post(self):
		song_name = request.form["song_name"]
		album_id = request.form["album_id"]
		lyrics = request.form["lyrics"]
		genre = request.form["genre_id"]
		minutes = request.form["minutes"]
		seconds = request.form["seconds"]
		collaborator_1 = request.form["collaborator_1"]
		collaborator_2 = request.form["collaborator_2"]
		collaborator_3 = request.form["collaborator_3"]
		collaborator_4 = request.form["collaborator_4"]
		creator_id = request.form["creator_id"]
		token = request.form["token"]

		if session.get("role") == 'Creator' and token == session.get('token'):
			song = db.session.query(Song, Album).filter(and_(Song.song_name==song_name, Song.album_id==Album.album_id, Album.creator_id==creator_id)).first()

			if song is not None:
				return jsonify({'status_code':401, 'message':'Song Present'})

			audio = request.files['audio']
			seq = Sqlite_sequence.query.get("song").seq
			filename = str(seq+1) + ".mp3"
			path = f"static/audio/{filename}"
			audio.save(path)

			duration = str(minutes)+"m "+str(seconds)+"s"
			date_added = datetime.today().strftime('%d-%m-%Y')

			collab_receiver = db.session.query(Album).with_entities(Album.creator_id).filter(Album.album_id==album_id).first()[0]

			song = Song(song_name=song_name, album_id=album_id, lyrics=lyrics, genre=genre, duration=duration, date_added=date_added, audio=path)
			db.session.add(song)
			db.session.commit()

			song = db.session.query(Song).order_by(Song.song_id.desc()).limit(1)[0]
			album = Album.query.get(album_id)

			if collaborator_1 != "" and collaborator_1 != None and collaborator_1 != "null":
				collab_1 = Pending_collabs(collab_requester=creator_id, collab_receiver=collaborator_1, song_id=song.song_id)
				db.session.add(collab_1)

			if collaborator_2 != "" and collaborator_2 != None and collaborator_2 != "null":
				collab_2 = Pending_collabs(collab_requester=creator_id, collab_receiver=collaborator_2, song_id=song.song_id)
				db.session.add(collab_2)

			if collaborator_3 != "" and collaborator_3 != None and collaborator_3 != "null":
				collab_3 = Pending_collabs(collab_requester=creator_id, collab_receiver=collaborator_3, song_id=song.song_id)
				db.session.add(collab_3)

			if collaborator_4 != "" and collaborator_4 != None and collaborator_4 != "null":
				collab_4 = Pending_collabs(collab_requester=creator_id, collab_receiver=collaborator_4, song_id=song.song_id)
				db.session.add(collab_4)

			db.session.commit()

			playlist_content = Playlist_content(playlist_id=album.playlist_id, song_id=song.song_id)
			db.session.add(playlist_content)
			db.session.commit()

			return jsonify({'status_code':200, 'message':'Song Upload Successful'})
		else:
			return jsonify({'status_code':401, 'message':"Unauthorized Access"})

	#Updated
	def delete(self):
		song_id = request.args.get('song_id')
		token = request.args.get('token')

		if (session.get("role") == 'Creator' or session.get("role") == 'Admin') and token == session.get('token'):
			if song_id is None:
				return jsonify({'status_code': 409, 'message':'Song ID is required'})

			if not Song.query.filter(Song.song_id==song_id).first():
				return jsonify({'status_code': 401, 'message':'Song not found'})

			song = Song.query.filter(Song.song_id==song_id).delete()
			db.session.commit()
			
			return jsonify({'status_code':200, 'message':'Song Deleted'})

		else:
			return jsonify({'status_code':401, 'message':"Unauthorized Access"})

	#Updated
	def put(self):
		song_id = request.form["song_id"]
		song_name = request.form["song_name"]
		album_id = request.form["album_id"]
		lyrics = request.form["lyrics"]
		genre = request.form["genre_id"]
		minutes = request.form["minutes"]
		seconds = request.form["seconds"]
		collaborator_1 = request.form["collaborator_1"]
		collaborator_2 = request.form["collaborator_2"]
		collaborator_3 = request.form["collaborator_3"]
		collaborator_4 = request.form["collaborator_4"]
		creator_id = request.form["creator_id"]
		token = request.form["token"]

		if session.get("role") == 'Creator' and token == session.get('token'):
			song = Song.query.get(song_id)

			filename = str(song_id) + ".mp3"
			path = f"static/audio/{filename}"
			try:
				audio = request.files["audio"]
				if audio:
					try:
						os.remove(path)
					except:
						pass
					audio.save(path)
			except:
				pass

			curr_song = Song.query.get(song_id)
			prev_collab_1 = curr_song.collaborator_1
			prev_collab_2 = curr_song.collaborator_2
			prev_collab_3 = curr_song.collaborator_3
			prev_collab_4 = curr_song.collaborator_4

			song = db.session.query(Song).filter(and_(Song.song_name==song_name, Song.song_id!=song_id)).first()

			if song is not None:
				return jsonify({'status_code':401, 'message':'Song Present'})

			#collab_receiver = db.session.query(Album).with_entities(Album.creator_id).filter(Album.album_id==album_id).first()[0]

			duration = str(request.form["minutes"])+"m "+str(request.form["seconds"])+"s"
			date_added = datetime.today().strftime('%d-%m-%Y')

			u = update(Song)
			u = u.values({"song_name":song_name, "album_id":album_id, "lyrics":lyrics, "genre":genre, "duration":duration, "date_added":date_added, "audio":path})
			u = u.where(Song.song_id == song_id)
			db.session.execute(u)

			if collaborator_1 != "" and collaborator_1 != None and collaborator_1 != "null" and not prev_collab_1:
				collab_1 = Pending_collabs(collab_requester=creator_id, collab_receiver=collaborator_1, song_id=song_id)
				db.session.add(collab_1)

			if collaborator_2 != "" and collaborator_2 != None and collaborator_2 != "null" and not prev_collab_2:
				collab_2 = Pending_collabs(collab_requester=creator_id, collab_receiver=collaborator_2, song_id=song_id)
				db.session.add(collab_2)

			if collaborator_3 != "" and collaborator_3 != None and collaborator_3 != "null" and not prev_collab_3:
				collab_3 = Pending_collabs(collab_requester=creator_id, collab_receiver=collaborator_3, song_id=song_id)
				db.session.add(collab_3)

			if collaborator_4 != "" and collaborator_4 != None and collaborator_4 != "null" and not prev_collab_4:
				collab_4 = Pending_collabs(collab_requester=creator_id, collab_receiver=collaborator_4, song_id=song_id)
				db.session.add(collab_4)

			db.session.commit()

			return jsonify({'status_code':200, 'message':'Song Update Successful'})
		else:
			return jsonify({'status_code':401, 'message':"Unauthorized Access"})

class ViewLyricsAPI(Resource):
	def get(self):
		song_id = request.args.get('song_id')
		user_id = request.args.get('user_id')
		token = request.args.get('token')

		if session.get('token') == token:
			song = Song.query.get(song_id)
			flag = User.query.get(user_id).view_flagged
			song_dict = {"song_id": song.song_id,"song_name": song.song_name, "album": song.album_id,"lyrics": song.lyrics}
			return jsonify({'status_code':200, 'message':'Song Retrieval Successful', "song":song_dict, "flag":flag})
		else:
			return jsonify({'status_code':401, 'message':"Unauthorized Access"})

#Not Updated
class CollaborationAPI(Resource):
	def get(self):
		creator_id = request.args.get("creator_id")
		token = request.args.get("token")

		if session.get("role") == 'Creator' and token == session.get('token'):
			received_collabs = db.session.query(Pending_collabs, Song, Creator).with_entities(Pending_collabs.collab_id, Pending_collabs.collab_requester, Pending_collabs.collab_receiver, Pending_collabs.song_id, Song.song_name, Creator.creator_name).filter(and_(Pending_collabs.collab_receiver==creator_id, Song.song_id==Pending_collabs.song_id, Pending_collabs.collab_requester==Creator.creator_id)).all()
			sent_collabs = db.session.query(Pending_collabs, Song, Creator).with_entities(Pending_collabs.collab_id, Pending_collabs.collab_requester, Pending_collabs.collab_receiver, Pending_collabs.song_id, Song.song_name, Creator.creator_name).filter(and_(Pending_collabs.collab_requester==creator_id, Song.song_id==Pending_collabs.song_id, Pending_collabs.collab_receiver==Creator.creator_id)).all()

			try:
				received_collabs_data = []
				for collab in received_collabs:
					received_collabs_dict = {"collab_id": collab[0],"collab_requester": collab[1], "collab_receiver": collab[2],"song_id": collab[3], "song_name": collab[4], "creator_name":collab[5]}
					received_collabs_data.append(received_collabs_dict)	
			except:
				received_collabs_dict = {}
			try:
				sent_collabs_data = []
				for collab in sent_collabs:
					sent_collabs_dict = {"collab_id": collab[0],"collab_requester": collab[1], "collab_receiver": collab[2],"song_id": collab[3], "song_name": collab[4], "creator_name":collab[5]}
					sent_collabs_data.append(sent_collabs_dict)
			except:
				sent_collabs_dict = {}

			return jsonify({"status_code": 200, "message": "Retrieval Successful", "received_collabs":received_collabs_data, "sent_collabs": sent_collabs_data})
		else:
			return jsonify({'status_code':401, 'message':"Unauthorized Access"})

	def post(self):
		data = request.json
		collab_id = data.get("collab_id")
		action = data.get("action")
		token = data.get("token")

		if session.get("role") == 'Creator' and token == session.get('token'):
			collab = Pending_collabs.query.get(collab_id)
			song = Song.query.get(collab.song_id)

			if song.collaborator_4 != None and song.collaborator_4 != "":
				collab = Pending_collabs.query.filter(Pending_collabs.collab_id==collab_id).delete()
				db.session.commit()
				return jsonify({'status_code': 401, 'message': 'Collab List Full'})

			elif song.collaborator_3 != None and song.collaborator_3 != "":
				temp = "collaborator_4"

			elif song.collaborator_2 != None and song.collaborator_2 != "":
				temp = "collaborator_3"

			elif song.collaborator_1 != None and song.collaborator_1 != "":
				temp = "collaborator_2"

			else:
				temp = "collaborator_1"

			if action == "Accept":
				u = update(Song)
				u = u.values({temp:collab.collab_receiver})
				u = u.where(Song.song_id == collab.song_id)
				db.session.execute(u)

				collab = Pending_collabs.query.filter(Pending_collabs.collab_id==collab_id).delete()
				db.session.commit()

				return jsonify({'status_code': 200, 'message': 'Collab Request Accepted'})

			if action == "Reject":
				collab = Pending_collabs.query.filter(Pending_collabs.collab_id==collab_id).delete()
				db.session.commit()

				return jsonify({'status_code': 200, 'message': 'Collab Request Rejected'})

		else:
			return jsonify({'status_code':401, 'message':"Unauthorized Access"})

	#Not Updated
	def delete(self):
		creator_id = request.args.get("creator_id")
		song_id = request.args.get("song_id")
		token = request.args.get("token")

		if session.get("role") == 'Creator' and token == session.get('token'):
			song = Song.query.get(song_id)

			if int(song.collaborator_1) == int(creator_id):
				temp = "collaborator_1"

			elif int(song.collaborator_2) == int(creator_id):
				temp = "collaborator_2"

			elif int(song.collaborator_3) == int(creator_id):
				temp = "collaborator_3"

			elif int(song.collaborator_4) == int(creator_id):
				temp = "collaborator_4"

			u = update(Song)
			u = u.values({temp:None})
			u = u.where(Song.song_id == song_id)
			db.session.execute(u)
			db.session.commit()

			return jsonify({'status_code': 200, 'message': 'Collaboration Deleted'})
		else:
			return jsonify({'status_code':401, 'message':"Unauthorized Access"})

class UserHomeAPI(Resource):
	def get(self):
		user_id = request.args.get("user_id")
		token = request.args.get("token")

		if (session.get("role") == 'User' or session.get("role") == 'Creator') and token == session.get('token'):
			if (datetime.now()).strftime('%A') == 'Monday':
				top_songs = db.session.query(Song).order_by(Song.plays_last_week.desc()).limit(1)[0]

				top_song = {"album_id": top_songs.album_id}

				genre_playlists = {"p_1": "Pop Shots", "p_2": "Jazz Journeys", "p_3": "Rock Rhythms", "p_4": "Hip Hop Hustle", 'p_5': 'R&B Reflections', 'p_6': 'Metal Mayhem', 'p_7': 'Country Crossroads', 'p_8': 'Electronic Escapes', 'p_9': 'Folk Fables', 'p_10': 'Acoustic Adventures', 'p_11': 'Classical Crescendos', 'p_12': 'Blue Ballads'}
				con = {}

				for i in genre_playlists:
					try:
						temp = i[2:]
						con[i] = (db.session.query(Song).filter(Song.genre==temp).order_by(Song.plays_last_week.desc()).limit(1)[0]).album_id
					except:
						con[i] = None

				albums_data = []
				top_albums = db.session.query(Song, Album).with_entities(Album.album_id, Album.album_name, Album.playlist_id).filter(Song.album_id == Album.album_id).order_by(Song.plays_last_week.desc()).distinct()
				
				for album in top_albums:
					album_dict = {"album_id": album.album_id, "album_name": album.album_name, "playlist_id": album.playlist_id}
					albums_data.append(album_dict)

				creators_data = []
				top_creators = db.session.query(Song, Album, Creator).with_entities(Album.creator_id, Creator.creator_name, Creator.profile).filter(Song.album_id == Album.album_id, Album.creator_id == Creator.creator_id).order_by(Song.plays_last_week.desc()).distinct()
				for creators in top_creators:
					creator_dict = {"creator_id": creators.creator_id, "creator_name": creators.creator_name, "profile": creators.profile}
					creators_data.append(creator_dict)

				try:
					hot_hindi = (db.session.query(Song, Album).filter(Song.album_id == Album.album_id, Album.language == "Hindi").order_by(Song.plays_last_week.desc()).limit(1)[0][1]).album_id
				except:
					hot_hindi = None

				try:
					eclectic_english = (db.session.query(Song, Album).filter(Song.album_id == Album.album_id, Album.language == "English").order_by(Song.plays_last_week.desc()).limit(1)[0][1]).album_id
				except:
					eclectic_english = None

				try:
					sizzling_spanish = (db.session.query(Song, Album).filter(Song.album_id == Album.album_id, Album.language == "Spanish").order_by(Song.plays_last_week.desc()).limit(1)[0][1]).album_id
				except:
					sizzling_spanish = None

				playlist_data = []
				playlist_history = db.session.query(Playlist, Playlist_history).filter(Playlist.playlist_id==Playlist_history.playlist_id, Playlist_history.user_id==user_id).all()
				for playlist in playlist_history:
					playlist_dict = {"playlist_id": (playlist[0]).playlist_id, "playlist_name": (playlist[0]).playlist_id}
					playlist_data.append(playlist_dict)

				all_albums_data = []
				albums = db.session.query(Album)
				for album in albums:
					album_dict = {"album_id": album.album_id, "album_name":album.album_name, "playlist_id": album.playlist_id}
					all_albums_data.append(album_dict)

				songs_data = []
				songs = db.session.query(Song)
				for song in songs:
					song_dict = {"album_id": song.album_id, "song_id": song.song_id}
					songs_data.append(song_dict)
				
				album_playlists = []
				albums_list = []

				for album in albums:
					album_playlists.append(album.playlist_id)

				song_playlists = {}
				phist = db.session.query(Playlist_history, Playlist_content).filter(Playlist_history.user_id==user_id, Playlist_history.playlist_id==Playlist_content.playlist_id)
				for i in phist:
					if i[0].playlist_id in song_playlists:
						pass
					else:
						song_playlists[i[0].playlist_id] = i[1].song_id

				for i in list(song_playlists):
					if i in album_playlists:
						song_playlists.pop(i, None)

				psongs = list(song_playlists.values())

				playlists = db.session.query(Playlist)
				for p in list(song_playlists):
					for playlist in playlists:
						if p == playlist.playlist_id:
							temp = song_playlists.pop(playlist.playlist_id)
							song_playlists[temp] = [playlist.playlist_name, playlist.playlist_id]

				user_playlists_data = []
				user_playlists = db.session.query(Playlist).filter(Playlist.user_id==user_id)
				for playlist in user_playlists:
					user_playlists_dict = {"playlist_id":playlist.playlist_id, "playlist_name":playlist.playlist_name}
					try:
						album_id = (db.session.query(Playlist_content, Album, Song).with_entities(Album.album_id).filter(Playlist_content.playlist_id==playlist.playlist_id, Playlist_content.song_id==Song.song_id, Song.album_id==Album.album_id).first()).album_id
					except:
						album_id = "default"
					user_playlists_dict["album_id"] = album_id
					user_playlists_data.append(user_playlists_dict)

				flag = User.query.get(user_id).view_flagged

				return jsonify({"status_code": 200, "message":"Retrieval Successful", "flag":flag, "top_song":top_song, "con":con, "playlist_names":genre_playlists, "top_albums":albums_data, "top_creators":creators_data, "hot_hindi":hot_hindi, "eclectic_english":eclectic_english, "sizzling_spanish":sizzling_spanish, "playlist_history":playlist_data, "songs":songs_data, "albums":all_albums_data, "song_playlists":song_playlists, "psongs":psongs, "user_playlists":user_playlists_data})	

			else:
				top_songs = db.session.query(Song).order_by(Song.plays_this_week.desc()).limit(1)[0]

				top_song = {"album_id": top_songs.album_id}

				genre_playlists = {"p_1": "Pop Shots", "p_2": "Jazz Journeys", "p_3": "Rock Rhythms", "p_4": "Hip Hop Hustle", 'p_5': 'R&B Reflections', 'p_6': 'Metal Mayhem', 'p_7': 'Country Crossroads', 'p_8': 'Electronic Escapes', 'p_9': 'Folk Fables', 'p_10': 'Acoustic Adventures', 'p_11': 'Classical Crescendos', 'p_12': 'Blue Ballads'}
				con = {}

				for i in genre_playlists:
					try:
						temp = i[2:]
						con[i] = (db.session.query(Song).filter(Song.genre==temp).order_by(Song.plays_this_week.desc()).limit(1)[0]).album_id
					except:
						con[i] = None

				albums_data = []
				top_albums = db.session.query(Song, Album).with_entities(Album.album_id, Album.album_name, Album.playlist_id).filter(Song.album_id == Album.album_id).order_by(Song.plays_this_week.desc()).distinct()
				
				for album in top_albums:
					album_dict = {"album_id": album.album_id, "album_name": album.album_name, "playlist_id": album.playlist_id}
					albums_data.append(album_dict)

				creators_data = []
				top_creators = db.session.query(Song, Album, Creator).with_entities(Album.creator_id, Creator.creator_name, Creator.profile).filter(Song.album_id == Album.album_id, Album.creator_id == Creator.creator_id).order_by(Song.plays_this_week.desc()).distinct()
				for creators in top_creators:
					creator_dict = {"creator_id": creators.creator_id, "creator_name": creators.creator_name, "profile": creators.profile}
					creators_data.append(creator_dict)

				try:
					hot_hindi = (db.session.query(Song, Album).filter(Song.album_id == Album.album_id, Album.language == "Hindi").order_by(Song.plays_this_week.desc()).limit(1)[0][1]).album_id
				except:
					hot_hindi = None

				try:
					eclectic_english = (db.session.query(Song, Album).filter(Song.album_id == Album.album_id, Album.language == "English").order_by(Song.plays_this_week.desc()).limit(1)[0][1]).album_id
				except:
					eclectic_english = None

				try:
					sizzling_spanish = (db.session.query(Song, Album).filter(Song.album_id == Album.album_id, Album.language == "Spanish").order_by(Song.plays_this_week.desc()).limit(1)[0][1]).album_id
				except:
					sizzling_spanish = None

				playlist_data = []
				playlist_history = db.session.query(Playlist, Playlist_history).filter(Playlist.playlist_id==Playlist_history.playlist_id, Playlist_history.user_id==user_id).all()
				for playlist in playlist_history:
					playlist_dict = {"playlist_id": (playlist[0]).playlist_id, "playlist_name": (playlist[0]).playlist_id}
					playlist_data.append(playlist_dict)

				all_albums_data = []
				albums = db.session.query(Album)
				for album in albums:
					album_dict = {"album_id": album.album_id, "album_name":album.album_name, "playlist_id": album.playlist_id}
					all_albums_data.append(album_dict)

				songs_data = []
				songs = db.session.query(Song)
				for song in songs:
					song_dict = {"album_id": song.album_id, "song_id": song.song_id}
					songs_data.append(song_dict)
				
				album_playlists = []
				albums_list = []

				for album in albums:
					album_playlists.append(album.playlist_id)

				song_playlists = {}
				phist = db.session.query(Playlist_history, Playlist_content).filter(Playlist_history.user_id==user_id, Playlist_history.playlist_id==Playlist_content.playlist_id)
				for i in phist:
					if i[0].playlist_id in song_playlists:
						pass
					else:
						song_playlists[i[0].playlist_id] = i[1].song_id

				for i in list(song_playlists):
					if i in album_playlists:
						song_playlists.pop(i, None)

				psongs = list(song_playlists.values())

				playlists = db.session.query(Playlist)
				for p in list(song_playlists):
					for playlist in playlists:
						if p == playlist.playlist_id:
							temp = song_playlists.pop(playlist.playlist_id)
							song_playlists[temp] = [playlist.playlist_name, playlist.playlist_id]

				user_playlists_data = []
				user_playlists = db.session.query(Playlist).filter(Playlist.user_id==user_id)
				for playlist in user_playlists:
					user_playlists_dict = {"playlist_id":playlist.playlist_id, "playlist_name":playlist.playlist_name}
					try:
						album_id = (db.session.query(Playlist_content, Album, Song).with_entities(Album.album_id).filter(Playlist_content.playlist_id==playlist.playlist_id, Playlist_content.song_id==Song.song_id, Song.album_id==Album.album_id).first()).album_id
					except:
						album_id = "default"
					user_playlists_dict["album_id"] = album_id
					user_playlists_data.append(user_playlists_dict)

				flag = User.query.get(user_id).view_flagged

				return jsonify({"status_code": 200, "message":"Retrieval Successful", "flag":flag, "top_song":top_song, "con":con, "playlist_names":genre_playlists, "top_albums":albums_data, "top_creators":creators_data, "hot_hindi":hot_hindi, "eclectic_english":eclectic_english, "sizzling_spanish":sizzling_spanish, "playlist_history":playlist_data, "songs":songs_data, "albums":all_albums_data, "song_playlists":song_playlists, "psongs":psongs, "user_playlists":user_playlists_data})
		else:
			return jsonify({'status_code':401, 'message':"Unauthorized Access"})

class TopPlaylistsAPI(Resource):
	def get(self):
		playlist_name = request.args.get("playlist_name")
		user_id = request.args.get("user_id")
		token = request.args.get("token")

		if (session.get("role") == 'User' or session.get("role") == 'Creator') and token == session.get('token'):
			if playlist_name == 'pop_shots':
				playlist_name = 'p_1'

			if (datetime.now()).strftime('%A') == 'Monday':
				if playlist_name == "todays_top_hits":
					header = "Today's Top Hits"
					top_songs = db.session.query(Song).order_by(Song.plays_this_week.desc()).all()
					songs_data = []

					for song in top_songs:
						song_dict = {"song_id": song.song_id, "song_name": song.song_name, "album_id":song.album_id, "lyrics":song.lyrics, "audio": song.audio, "rating":song.rating, "flag": song.flag}
						temp = db.session.query(Creator, Album).filter(Creator.creator_id==Album.creator_id, Album.album_id==song.album_id)
						song_dict["album_name"] = (temp.first()[1]).album_name
						song_dict["creator_name"] = (temp.first()[0]).creator_name
						song_dict["creator_id"] = (temp.first()[0]).creator_id
						song_dict["playlist_id"] = (temp.first()[1]).playlist_id

						for i in range(1,5):
							c = "collaborator_" + str(i)
							c_id = c+"_id"
							temp = db.session.query(Song, Creator, Album).filter(Creator.creator_id==getattr(Song, c), Album.album_id==Song.album_id, Song.song_id == song.song_id)
							if temp.first():
								song_dict[c] = (temp.first()[1]).creator_name
								song_dict[c_id] = (temp.first()[1]).creator_id

						songs_data.append(song_dict)

				genre_playlists = {"p_1": "Pop Shots", "p_2": "Jazz Journeys", "p_3": "Rock Rhythms", "p_4": "Hip Hop Hustle", 'p_5': 'R&B Reflections', 'p_6': 'Metal Mayhem', 'p_7': 'Country Crossroads', 'p_8': 'Electronic Escapes', 'p_9': 'Folk Fables', 'p_10': 'Acoustic Adventures', 'p_11': 'Classical Crescendos', 'p_12': 'Blue Ballads'}

				if playlist_name in list(genre_playlists.keys()):
					songs_data = []
					genre_id = (list(genre_playlists.keys()).index(playlist_name))+1
					header = genre_playlists[playlist_name]
					songs = db.session.query(Song).filter(Song.genre==genre_id).order_by(Song.plays_this_week.desc())

					for song in songs:
						song_dict = {"song_id": song.song_id, "song_name": song.song_name, "album_id":song.album_id, "lyrics":song.lyrics, "audio": song.audio, "rating":song.rating}
						temp = db.session.query(Creator, Album).filter(Creator.creator_id==Album.creator_id, Album.album_id==song.album_id)
						song_dict["album_name"] = (temp.first()[1]).album_name
						song_dict["creator_name"] = (temp.first()[0]).creator_name
						song_dict["creator_id"] = (temp.first()[0]).creator_id
						song_dict["playlist_id"] = (temp.first()[1]).playlist_id

						for i in range(1,5):
							c = "collaborator_" + str(i)
							c_id = c+"_id"
							temp = db.session.query(Song, Creator, Album).filter(Creator.creator_id==getattr(Song, c), Album.album_id==Song.album_id, Song.song_id == song.song_id)
							if temp.first():
								song_dict[c] = (temp.first()[1]).creator_name
								song_dict[c_id] = (temp.first()[1]).creator_id

						songs_data.append(song_dict)


				if playlist_name in ['hot_hindi', 'eclectic_english', 'sizzling_spanish']:
					header = (playlist_name.replace("_", " ")).title()
					language = (header.split(" "))[1]

					songs = db.session.query(Song, Album).filter(Song.album_id == Album.album_id, Album.language == language).order_by(Song.plays_this_week.desc())
					
					songs_data = []
					for song in songs:
						song_dict = {"song_id": song[0].song_id, "song_name": song[0].song_name, "album_id":song[0].album_id, "lyrics":song[0].lyrics, "audio": song[0].audio, "rating":song[0].rating}
						temp = db.session.query(Creator, Album).filter(Creator.creator_id==Album.creator_id, Album.album_id==song[0].album_id)
						song_dict["album_name"] = (temp.first()[1]).album_name
						song_dict["creator_name"] = (temp.first()[0]).creator_name
						song_dict["creator_id"] = (temp.first()[0]).creator_id
						song_dict["playlist_id"] = (temp.first()[1]).playlist_id

						for i in range(1,5):
							c = "collaborator_" + str(i)
							c_id = c+"_id"
							temp = db.session.query(Song, Creator, Album).filter(Creator.creator_id==getattr(Song, c), Album.album_id==Song.album_id, Song.song_id == song.song_id)
							if temp.first():
								song_dict[c] = (temp.first()[1]).creator_name
								song_dict[c_id] = (temp.first()[1]).creator_id

						songs_data.append(song_dict)

				playlists = db.session.query(Playlist, Album).with_entities(Playlist.playlist_id, Playlist.playlist_name).filter(Playlist.user_id==user_id, Album.playlist_id!=Playlist.playlist_id).distinct()
				playlists_data = []

				for playlist in playlists:
					playlist_dict = {"playlist_id":playlist.playlist_id, "playlist_name":playlist.playlist_name}
					playlists_data.append(playlist_dict)

				flag = User.query.get(user_id).view_flagged

				return jsonify({"status_code":200, "message": "Retrieval Successful", "flag":flag, "songs": songs_data, "playlists": playlists_data, "header": header})
			else:
				if playlist_name == "todays_top_hits":
					header = "Today's Top Hits"
					top_songs = db.session.query(Song).order_by(Song.plays_this_week.desc()).all()
					songs_data = []

					for song in top_songs:
						song_dict = {"song_id": song.song_id, "song_name": song.song_name, "album_id":song.album_id, "lyrics":song.lyrics, "audio": song.audio, "rating":song.rating, "flag": song.flag}
						temp = db.session.query(Creator, Album).filter(Creator.creator_id==Album.creator_id, Album.album_id==song.album_id)
						song_dict["album_name"] = (temp.first()[1]).album_name
						song_dict["creator_name"] = (temp.first()[0]).creator_name
						song_dict["creator_id"] = (temp.first()[0]).creator_id
						song_dict["playlist_id"] = (temp.first()[1]).playlist_id

						for i in range(1,5):
							c = "collaborator_" + str(i)
							c_id = c+"_id"
							temp = db.session.query(Song, Creator, Album).filter(Creator.creator_id==getattr(Song, c), Album.album_id==Song.album_id, Song.song_id == song.song_id)
							if temp.first():
								song_dict[c] = (temp.first()[1]).creator_name
								song_dict[c_id] = (temp.first()[1]).creator_id

						songs_data.append(song_dict)

				genre_playlists = {"p_1": "Pop Shots", "p_2": "Jazz Journeys", "p_3": "Rock Rhythms", "p_4": "Hip Hop Hustle", 'p_5': 'R&B Reflections', 'p_6': 'Metal Mayhem', 'p_7': 'Country Crossroads', 'p_8': 'Electronic Escapes', 'p_9': 'Folk Fables', 'p_10': 'Acoustic Adventures', 'p_11': 'Classical Crescendos', 'p_12': 'Blue Ballads'}

				if playlist_name in list(genre_playlists.keys()):
					songs_data = []
					genre_id = (list(genre_playlists.keys()).index(playlist_name))+1
					header = genre_playlists[playlist_name]
					songs = db.session.query(Song).filter(Song.genre==genre_id).order_by(Song.plays_this_week.desc())

					for song in songs:
						song_dict = {"song_id": song.song_id, "song_name": song.song_name, "album_id":song.album_id, "lyrics":song.lyrics, "audio": song.audio, "rating":song.rating}
						temp = db.session.query(Creator, Album).filter(Creator.creator_id==Album.creator_id, Album.album_id==song.album_id)
						song_dict["album_name"] = (temp.first()[1]).album_name
						song_dict["creator_name"] = (temp.first()[0]).creator_name
						song_dict["creator_id"] = (temp.first()[0]).creator_id
						song_dict["playlist_id"] = (temp.first()[1]).playlist_id

						for i in range(1,5):
							c = "collaborator_" + str(i)
							c_id = c+"_id"
							temp = db.session.query(Song, Creator, Album).filter(Creator.creator_id==getattr(Song, c), Album.album_id==Song.album_id, Song.song_id == song.song_id)
							if temp.first():
								song_dict[c] = (temp.first()[1]).creator_name
								song_dict[c_id] = (temp.first()[1]).creator_id

						songs_data.append(song_dict)


				if playlist_name in ['hot_hindi', 'eclectic_english', 'sizzling_spanish']:
					header = (playlist_name.replace("_", " ")).title()
					language = (header.split(" "))[1]

					songs = db.session.query(Song, Album).filter(Song.album_id == Album.album_id, Album.language == language).order_by(Song.plays_this_week.desc())
					
					songs_data = []
					for song in songs:
						song_dict = {"song_id": song[0].song_id, "song_name": song[0].song_name, "album_id":song[0].album_id, "lyrics":song[0].lyrics, "audio": song[0].audio, "rating":song[0].rating}
						temp = db.session.query(Creator, Album).filter(Creator.creator_id==Album.creator_id, Album.album_id==song[0].album_id)
						song_dict["album_name"] = (temp.first()[1]).album_name
						song_dict["creator_name"] = (temp.first()[0]).creator_name
						song_dict["creator_id"] = (temp.first()[0]).creator_id
						song_dict["playlist_id"] = (temp.first()[1]).playlist_id

						for i in range(1,5):
							c = "collaborator_" + str(i)
							c_id = c+"_id"
							temp = db.session.query(Song, Creator, Album).filter(Creator.creator_id==getattr(Song, c), Album.album_id==Song.album_id, Song.song_id == song.song_id)
							if temp.first():
								song_dict[c] = (temp.first()[1]).creator_name
								song_dict[c_id] = (temp.first()[1]).creator_id

						songs_data.append(song_dict)

				playlists = db.session.query(Playlist, Album).with_entities(Playlist.playlist_id, Playlist.playlist_name).filter(Playlist.user_id==user_id, Album.playlist_id!=Playlist.playlist_id).distinct()
				playlists_data = []

				for playlist in playlists:
					playlist_dict = {"playlist_id":playlist.playlist_id, "playlist_name":playlist.playlist_name}
					playlists_data.append(playlist_dict)

				flag = User.query.get(user_id).view_flagged

				return jsonify({"status_code":200, "message": "Retrieval Successful", "flag":flag, "songs": songs_data, "playlists": playlists_data, "header": header})
		else:
			return jsonify({'status_code':401, 'message':"Unauthorized Access"})

class PlaylistAPI(Resource):
	def get(self):
		#Get the arguments from the query
		playlist_id = request.args.get("playlist_id")
		user_id = request.args.get("user_id")
		songs = db.session.query(Song, Album).filter(Album.playlist_id==playlist_id, Album.album_id==Song.album_id).all()
		token = request.args.get("token")

		if (session.get("role") == 'User' or session.get("role") == 'Creator') and token == session.get('token'):
			#Set a flag to check if the playlist is made by the user
			songs_data = []

			albums = Album.query.all()
			album_playlists = []
			for album in albums:
				album_playlists.append(album.playlist_id)

			temp = Playlist.query.get(playlist_id)
			if temp.playlist_id not in album_playlists:
				if int(temp.user_id) == int(user_id):
					show_opts = True
				else:
					show_opts = False
			else:
				show_opts = False

			#If playlist is not an album, get it through the playlist_id
			if songs:
				pass
			else:
				songs = db.session.query(Song, Playlist_content).filter(Playlist_content.playlist_id==playlist_id, Song.song_id==Playlist_content.song_id).all()

			header = (Playlist.query.get(playlist_id)).playlist_name

			#Get the required elements from the database
			for song in songs:
				song_dict = {"song_id": song[0].song_id, "song_name": song[0].song_name, "album_id":song[0].album_id, "lyrics":song[0].lyrics, "audio": song[0].audio, "rating":song[0].rating, "flag":song[0].flag}
				temp = db.session.query(Creator, Album).filter(Creator.creator_id==Album.creator_id, Album.album_id==song[0].album_id)
				song_dict["album_name"] = (temp.first()[1]).album_name
				song_dict["creator_name"] = (temp.first()[0]).creator_name
				song_dict["creator_id"] = (temp.first()[0]).creator_id
				song_dict["playlist_id"] = (temp.first()[1]).playlist_id

				for i in range(1,5):
					c = "collaborator_" + str(i)
					c_id = c+"_id"
					temp = db.session.query(Song, Creator, Album).filter(Creator.creator_id==getattr(Song, c), Album.album_id==Song.album_id, Song.song_id == song[0].song_id)
					if temp.first():
						song_dict[c] = (temp.first()[1]).creator_name
						song_dict[c_id] = (temp.first()[1]).creator_id

				songs_data.append(song_dict)

			#List of playlists made by user to add songs to them
			playlists = db.session.query(Playlist, Album).with_entities(Playlist.playlist_id, Playlist.playlist_name).filter(Playlist.user_id==user_id, Album.playlist_id!=Playlist.playlist_id).distinct()
			playlists_data = []

			for playlist in playlists:
				if playlist.playlist_id not in album_playlists:
					playlist_dict = {"playlist_id":playlist.playlist_id, "playlist_name":playlist.playlist_name}
					playlists_data.append(playlist_dict)

			flag = User.query.get(user_id).view_flagged

			return jsonify({"status_code":200, "message": "Retrieval Successful", "flagged":flag, "songs": songs_data, "playlists": playlists_data, "header": header, "flag":show_opts})
		else:
			return jsonify({'status_code':401, 'message':"Unauthorized Access"})

	def put(self):
		playlist_id = request.args.get("playlist_id")
		song_id = request.args.get("song_id")
		playlist_name = request.args.get("playlist_name")
		user_id = request.args.get("user_id")
		token = request.args.get("token")

		if (session.get("role") == 'User' or session.get("role") == 'Creator') and token == session.get('token'):
			if song_id:
				playlist_content = db.session.query(Playlist_content).filter(Playlist_content.song_id==song_id, Playlist_content.playlist_id==playlist_id)
				if playlist_content.first():
					return jsonify({"status_code":401, "message": "Sorry, that song's already been added to the playlist!"})

				playlist_content = Playlist_content(song_id=song_id, playlist_id=playlist_id)
				db.session.add(playlist_content)
				db.session.commit()

				return jsonify({"status_code":200, "message": "Added Successfully"})

			else:
				playlist = db.session.query(Playlist).filter(Playlist.playlist_name==playlist_name, Playlist.playlist_id!=playlist_id,Playlist.user_id==user_id)
				if playlist.first():
					return jsonify({"status_code":401, "message": "Playlist with the same name already exists"})
				else:
					u = update(Playlist)
					u = u.values({"playlist_name":playlist_name})
					u = u.where(Playlist.playlist_id == playlist_id)
					db.session.execute(u)
					db.session.commit()

					return jsonify({"status_code":200, "message": "Updated Successfully"})
		else:
			return jsonify({'status_code':401, 'message':"Unauthorized Access"})

	def post(self):
		playlist_name = request.args.get("playlist_name")
		song_id = request.args.get("song_id")
		user_id = request.args.get("user_id")
		token = request.args.get("token")

		if (session.get("role") == 'User' or session.get("role") == 'Creator') and token == session.get('token'):
			playlist = db.session.query(Playlist).filter(Playlist.playlist_name==playlist_name, Playlist.user_id==user_id)
			if playlist.first():
				return jsonify({"status_code":401, "message": "Sorry, a playlist with the same name already exists!"})

			playlist = Playlist(user_id=user_id, playlist_name=playlist_name)
			db.session.add(playlist)
			db.session.commit()

			playlist = db.session.query(Playlist).filter(Playlist.playlist_name==playlist_name, Playlist.user_id==user_id).first()

			return jsonify({"status_code":200, "message": "Added Successfully", "playlist_id": playlist.playlist_id})
		else:
			return jsonify({'status_code':401, 'message':"Unauthorized Access"})

	def delete(self):
		playlist_id = request.args.get("playlist_id")
		song_id = request.args.get("song_id")
		token = request.args.get("token")

		if (session.get("role") == 'User' or session.get("role") == 'Creator') and token == session.get('token'):
			if song_id:
				playlist_content = Playlist_content.query.filter(Playlist_content.playlist_id==playlist_id, Playlist_content.song_id==song_id).delete()
				db.session.commit()
				return jsonify({'status_code':200, 'message':'Song Deleted'})	
			else:
				playlist_content = Playlist_content.query.filter(Playlist_content.playlist_id==playlist_id).delete()
				playlist_history = Playlist_history.query.filter(Playlist_history.playlist_id==playlist_id).delete()

				playlist = Playlist.query.filter(Playlist.playlist_id==playlist_id).delete()
				db.session.commit()
				
				return jsonify({'status_code':200, 'message':'Playlist Deleted'})
		else:
			return jsonify({'status_code':401, 'message':"Unauthorized Access"})

class UserRatingAPI(Resource):
	def post(self):
		token = request.args.get("token")

		if (session.get("role") == 'User' or session.get("role") == 'Creator') and token == session.get('token'):
			song_id = request.args.get("song_id")
			rating = int(request.args.get("rating"))

			song = Song.query.get(song_id)
			if song.rating:
				u = update(Song)
				u = u.values({"rating":((song.rating+rating)/2)})
				u = u.where(Song.song_id == song_id)
				db.session.execute(u)
				db.session.commit()
			else:
				u = update(Song)
				u = u.values({"rating":rating})
				u = u.where(Song.song_id == song_id)
				db.session.execute(u)
				db.session.commit()

			return jsonify({"status_code":200, "message": "Added Successfully"})

		else:
			return jsonify({'status_code':401, 'message':"Unauthorized Access"})

class IncreasePlaysAPI(Resource):
	def post(self):
		song_id = request.args.get("song_id")
		playlist_id = request.args.get("playlist_id")
		user_id = request.args.get("user_id")
		token = request.args.get("token")

		if (session.get("role") == 'User' or session.get("role") == 'Creator') and token == session.get('token'):
			song = Song.query.get(song_id)
			if song.plays_this_week:
				u = update(Song)
				u = u.values({"plays":song.plays+1, "plays_this_week":song.plays_this_week+1, "plays_this_month":song.plays_this_month+1})
				u = u.where(Song.song_id == song_id)
				db.session.execute(u)
			elif song.plays_this_month:
				u = update(Song)
				u = u.values({"plays":song.plays+1, "plays_this_week":1, "plays_this_month":song.plays_this_month+1})
				u = u.where(Song.song_id == song_id)
				db.session.execute(u)
			elif song.plays:
				u = update(Song)
				u = u.values({"plays":song.plays+1, "plays_this_week":1, "plays_this_month":1})
				u = u.where(Song.song_id == song_id)
				db.session.execute(u)
			else:
				u = update(Song)
				u = u.values({"plays":1, "plays_this_week":1, "plays_this_month":1})
				u = u.where(Song.song_id == song_id)
				db.session.execute(u)

			if playlist_id != "null":
				playlist_history = db.session.query(Playlist_history).filter(Playlist_history.user_id==user_id, Playlist_history.playlist_id==playlist_id)
				
				if not playlist_history.first():
					playlist_history = Playlist_history(user_id=user_id, playlist_id=playlist_id, date=datetime.today().strftime('%d-%m-%Y'))
					db.session.add(playlist_history)

			song_history = Song_history(user_id=user_id, song_id=song_id, date=datetime.today().strftime('%d-%m-%Y'))
			db.session.add(song_history)
			db.session.commit()

		else:
			return jsonify({'status_code':401, 'message':"Unauthorized Access"})

class SearchAPI(Resource):
	def get(self):
		search = request.args.get("search")
		user_id = request.args.get("user_id")
		creator_id = request.args.get("creator_id")
		genre_id = request.args.get("genre_id")
		rating = request.args.get("rating")
		token = request.args.get("token")

		if (session.get("role") == 'User' or session.get("role") == 'Creator') and token == session.get('token'):
			creators = Creator.query.all()
			songs = Song.query.all()
			albums = Album.query.all()
			playlists = Playlist.query.all()
			genres = Genre.query.all()

			all_creators_data = []
			for creator in creators:
				creator_dict = {"creator_name":creator.creator_name, "creator_id":creator.creator_id}
				all_creators_data.append(creator_dict)

			genres_data = []
			for genre in genres:
				genre_dict = {"genre_name":genre.genre_name, "genre_id":genre.genre_id}
				genres_data.append(genre_dict)

			if search:
				creators_data = []
				for creator in creators:
					if search.lower() in (creator.creator_name).lower():
						creator_dict = {"creator_name":creator.creator_name, "creator_id":creator.creator_id}
						creators_data.append(creator_dict)

				songs_data = []
				for song in songs:
					if search.lower() in (song.song_name).lower():
						if genre_id != "null":
							if int(song.genre) == int(genre_id):
								song_dict = {"song_name":song.song_name, "song_id":song.song_id, "album_id":song.album_id}
								temp = (db.session.query(Creator, Album).filter(Creator.creator_id==Album.creator_id, Album.album_id==song.album_id).first())
								song_dict["creator_name"] = temp[0].creator_name
								song_dict["playlist_id"] = temp[1].playlist_id
								songs_data.append(song_dict)
						elif rating != "null":
							if song.rating != None:
								if float(song.rating) >= float(rating):
									song_dict = {"song_name":song.song_name, "song_id":song.song_id, "album_id":song.album_id}
									temp = (db.session.query(Creator, Album).filter(Creator.creator_id==Album.creator_id, Album.album_id==song.album_id).first())
									song_dict["creator_name"] = temp[0].creator_name
									song_dict["playlist_id"] = temp[1].playlist_id
									songs_data.append(song_dict)
						else:
							song_dict = {"song_name":song.song_name, "song_id":song.song_id, "album_id":song.album_id}
							temp = (db.session.query(Creator, Album).filter(Creator.creator_id==Album.creator_id, Album.album_id==song.album_id).first())
							song_dict["creator_name"] = temp[0].creator_name
							song_dict["playlist_id"] = temp[1].playlist_id
							songs_data.append(song_dict)

				albums_data = []
				for album in albums:
					if search.lower() in (album.album_name).lower():
						if creator_id != "null":
							if int(album.creator_id) == int(creator_id):
								album_dict = {"album_name":album.album_name, "album_id":album.album_id, "playlist_id":album.playlist_id}
								creator_name = (db.session.query(Creator, Album).filter(Creator.creator_id==Album.creator_id).first()[0]).creator_name
								album_dict["creator_name"] = creator_name
								albums_data.append(album_dict)
						else:
							album_dict = {"album_name":album.album_name, "album_id":album.album_id, "playlist_id":album.playlist_id}
							creator_name = (db.session.query(Creator, Album).filter(Creator.creator_id==Album.creator_id).first()[0]).creator_name
							album_dict["creator_name"] = creator_name
							albums_data.append(album_dict)

				playlists_data = []
				for playlist in playlists:
					if search.lower() in (playlist.playlist_name).lower():
						playlist_dict = {"playlist_name":playlist.playlist_name, "playlist_id":playlist.playlist_id}
						user_name = (db.session.query(User, Playlist).filter(User.id == Playlist.user_id).first()[0]).name
						try:
							album_id = (db.session.query(Album).filter(Album.playlist_id == playlist.playlist_id).first()).album_id
							if album_id:
								album_id = None
						except:
							try:
								album_id = (db.session.query(Playlist_content, Album, Song).with_entities(Album.album_id).filter(Playlist_content.playlist_id==playlist.playlist_id, Playlist_content.song_id==Song.song_id, Song.album_id==Album.album_id).first()).album_id
							except:
								pass
						try: 
							if album_id:
								playlist_dict["user_name"] = user_name
								playlist_dict["album_id"] = album_id
								playlists_data.append(playlist_dict)
						except:
							pass
			else:
				creators_data = None
				songs_data = None
				albums_data = None
				playlists_data = None

			flag = User.query.get(user_id).view_flagged
			return jsonify({'status_code':200, 'message':'Retrieval Successful', 'genres':genres_data, 'all_creators': all_creators_data, 'flag':flag, 'creators':creators_data, 'songs':songs_data, 'albums':albums_data, 'playlists':playlists_data})
		else:
			return jsonify({'status_code':401, 'message':"Unauthorized Access"})


class AdminHomeAPI(Resource):
	def get(self):
		token = request.args.get("token")
		print("Hi")

		if session.get("role") == 'Admin' and token == session.get('token'):
			total_users = db.session.query(User).join(Role.users).filter(Role.id == 2).count()
			total_creators = db.session.query(User).join(Role.users).filter(Role.id == 3).count()
			total_songs = db.session.query(Song).count()
			total_albums = db.session.query(Album).count()

			end_date = datetime.now()
			start_date = (end_date - timedelta(days=7)).strftime('%d-%m-%Y')
			start_day = int((start_date).split('-')[0])
			start_month = int((start_date).split('-')[1])
			start_year = int((start_date).split('-')[2])

			query = db.session.query((Song_history.date).label('play_date'),func.count(Song_history.song_id).label('play_count')) \
	                    .group_by(Song_history.date) \
	                    .all()

			# Converting to a DataFrame
			df = pd.DataFrame(query, columns=['play_date', 'play_count'])
			df["day"] = df['play_date'].str.split('-').str[0]
			df["month"] = df['play_date'].str.split('-').str[1]
			df["year"] = df['play_date'].str.split('-').str[2]
			df.day = pd.to_numeric(df.day, errors='coerce')
			df.month = pd.to_numeric(df.month, errors='coerce')
			df.year = pd.to_numeric(df.year, errors='coerce')
			df = df.query('(year>@start_year) | (month>@start_month & year==@start_year) | (day>@start_day & month==@start_month & year==@start_year)')

			# Plot the line chart
			plt.figure(figsize=(10, 6))
			plt.plot(df['play_date'], df['play_count'], marker='o', linestyle='-')
			plt.title('Song Plays Over the Last Week')
			plt.xlabel('Date')
			plt.ylabel('Number of Plays')
			plt.xticks(rotation=45)
			plt.tight_layout()
			ax = plt.gca()
			ax.set_facecolor('grey')
			plt.savefig('static/charts/line.jpeg')

			query = db.session.query((Song.song_name),func.sum(Song.plays_this_week)).group_by(Song.song_name).order_by(Song.plays_this_week.desc()).all()
			df = pd.DataFrame(query, columns=['song', 'play_count'])

			plt.figure(figsize=(10, 6))
			plt.bar(df['song'], df['play_count'])
			plt.title('Top Songs')
			plt.xlabel('Song')
			plt.ylabel('Number of Plays')
			plt.xticks(rotation=45)
			plt.tight_layout()
			ax = plt.gca()
			ax.set_facecolor('grey')
			plt.savefig('static/charts/bar.jpeg')

			return jsonify({'status_code':200, 'message':'Retrieval Successful', 'total_users':total_users, 'total_creators':total_creators, 'total_songs':total_songs, 'total_albums':total_albums})
		else:
			return jsonify({'status_code':401, 'message':"Unauthorized Access"})

class AdminSearchAPI(Resource):
	def get(self):
		search = request.args.get("search")
		token = request.args.get("token")

		if session.get("role") == 'Admin' and token == session.get('token'):

			creators = Creator.query.all()
			songs = Song.query.all()
			albums = Album.query.all()

			if search:
				creators_data = []
				for creator in creators:
					if search.lower() in (creator.creator_name).lower():
						creator_dict = {"creator_name":creator.creator_name, "creator_id":creator.creator_id}
						creators_data.append(creator_dict)

				songs_data = []
				for song in songs:
					if search.lower() in (song.song_name).lower():
						song_dict = {"song_name":song.song_name, "song_id":song.song_id, "album_id":song.album_id, "flag":song.flag}
						temp = (db.session.query(Creator, Album).filter(Creator.creator_id==Album.creator_id, Album.album_id==song.album_id).first())
						song_dict["creator_name"] = temp[0].creator_name
						song_dict["playlist_id"] = temp[1].playlist_id
						songs_data.append(song_dict)

				albums_data = []
				for album in albums:
					if search.lower() in (album.album_name).lower():
						album_dict = {"album_name":album.album_name, "album_id":album.album_id, "playlist_id":album.playlist_id}
						creator_name = (db.session.query(Creator, Album).filter(Creator.creator_id==Album.creator_id).first()[0]).creator_name
						album_dict["creator_name"] = creator_name
						albums_data.append(album_dict)
			else:
				creators_data = None
				songs_data = None
				albums_data = None

			if not creators and not songs and not albums:
				return jsonify({'status_code':200, 'message':'No Results'})

			return jsonify({'status_code':200, 'message':'Retrieval Successful', 'creators':creators_data, 'songs':songs_data, 'albums':albums_data})
		else:
			return jsonify({'status_code':401, 'message':"Unauthorized Access"})

class ChangeFlagAPI(Resource):
	def post(self):
		user_id = request.args.get("user_id")
		flag = request.args.get("flag")
		token = request.args.get("token")

		if (session.get("role") == 'User' or session.get("role") == 'Creator') and token == session.get('token'):
			update = User.query.filter_by(id=user_id).first()
			if flag == "true":
				update.view_flagged = False
			else:
				update.view_flagged = True
			db.session.commit()
		else:
			return jsonify({'status_code':401, 'message':"Unauthorized Access"})

class FlagSongAPI(Resource):
	def post(self):
		song_id = request.args.get("song_id")
		flag = request.args.get("flag")
		token = request.args.get("token")

		if session.get("role") == 'Admin' and token == session.get('token'):
			update = Song.query.filter_by(song_id=song_id).first()
			if flag:
				update.flag = flag
			else:
				update.flag = None
			db.session.commit()

			return jsonify({'status_code':200, 'message':'Operation Successful'})
		else:
			return jsonify({'status_code':401, 'message':"Unauthorized Access"})