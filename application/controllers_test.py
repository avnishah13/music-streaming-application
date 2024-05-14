#Import Libraries
from flask import Flask, request, url_for, flash, render_template, redirect, session, make_response
from flask import current_app as app
from application.models import User, Album, Artist, Genre, Likes, Playlist, Role, Playlist_content, Song, Pending_collabs, Playlist_history, Song_history, Sqlite_sequence
from application.database import db
from sqlalchemy import select, update, delete, values, func, exc, text, or_, and_
from app import hashing
import logging, requests, os
from functools import wraps
from datetime import datetime, timedelta
from statistics import mean
import phonenumbers as pn 
from phonenumbers import geocoder 

#Define wrapper for token authentication
def require_api_token(func):
    @wraps(func)
    def check_token(*args, **kwargs):
        # Check to see if it's in their session
        if 'api_session_token' not in session:
            return redirect(url_for("user_login", login="False"))
        # Otherwise just send them where they wanted to go
        return func(*args, **kwargs)
    return check_token

#Wrapper for Role Based Access Control
def access_required(role="ANY"):
    def wrapper(fn):
        @wraps(fn)
        def decorated_view(*args, **kwargs):
            if (session.get("role") == 'User' and role == 'User') or (session.get("role") == 'Creator' and role == 'User'):
                return fn(*args, **kwargs)
            elif session.get("role") == 'Admin' and role == 'Admin':
                return fn(*args, **kwargs)
            elif session.get("role") == 'Creator' and role == 'Creator':
                return fn(*args, **kwargs)
            elif session.get("role") == 'Admin':
            	return redirect(url_for('admin_home', auth="False")) 
            elif role == 'Creator' and session.get("role") == 'User':
            	return redirect(url_for('creator_signup', auth="False"))
            elif role == 'Creator' and (session.get("role") == None or role == "ANY"):
            	return redirect(url_for('creator_login', login="False"))
            elif session.get("role") == 'Creator':
            	return redirect(url_for('creator_home', auth="False")) 
            elif session.get("role") == 'User':
            	return redirect(url_for('user_home', auth="False"))
            elif role == "User":
            	return redirect(url_for('user_login', login="False"))
            else:
                return redirect(url_for('user_login'))
            return fn(*args, **kwargs)
        return decorated_view
    return wrapper

#Login Page for Users
@app.route("/", methods=["GET","POST"])
def user_login():
	if request.method == "GET":
		return render_template("user_login.html", login=request.args.get('login'))
	elif request.method == "POST":
		result = requests.post(url="http://127.0.0.1:5000/api/login", data={"username": request.form["username"], "password": request.form["password"]}).json()
		#Add user's auth token and role to session if credentials are correct
		if (result["status_code"] == 200):
			session.permanent = True
			session['api_session_token'] = result["token"]
			session['role'] = result["role"]
			session['user_id'] = result["user_id"]
			return redirect(url_for('user_home'))
		else:
			#Error handling in case of incorrect credentials
			if result["message"] == "Incorrect Password":
				return render_template('user_login.html', password='False')
			elif result["message"] == "Wrong Account Details":
				return render_template('user_login.html', username='False')
			else:
				return render_template('user_login.html')

@app.route("/user/signup", methods=["GET","POST"])
def user_signup():
	if request.method == "GET":
		return render_template("user_signup.html")
	elif request.method == "POST":
		print(request.form["name"])
		result = requests.post(url="http://127.0.0.1:5000/api/signup", data={"username": request.form["username"], "password": request.form["password"], "name": request.form["name"], "email": request.form["email"], "phone": request.form["phone"]}).json()
		if (result["status_code"] == 200):
			session.permanent = True
			session['api_session_token'] = result["token"]
			session['role'] = result["role"]
			session['user_id'] = result["user_id"]
			return redirect(url_for('user_home'))

		else:
			#Error handling in case of incorrect credentials
			if result["message"] == "Username taken":
				return render_template('user_signup.html', username='False')
			elif result["message"] == "Email taken":
				return render_template('user_signup.html', email='False')
			elif result["message"] == "Phone number taken":
				return render_template('user_signup.html', phone='False')
			else:
				return render_template('user_signup.html')

#Login Page for Admin
@app.route("/admin/login", methods=["GET","POST"])
def admin_login():
	if request.method == "GET":
		return render_template("admin_login.html", login=request.args.get('login'))
	elif request.method == "POST":
		result = requests.post(url="http://127.0.0.1:5000/api/admin/login", data={"username": request.form["username"], "password": request.form["password"]}).json()
		#Add admin's auth token and role to session if credentials are correct
		if (result["status_code"] == 200):
			session.permanent = True
			session['api_session_token'] = result["token"]
			session['role'] = result["role"]
			session['user_id'] = result["user_id"]
			return redirect(url_for('admin_home'))
		else:
			#Error handling in case of incorrect credentials
			if result["message"] == "Incorrect Password":
				return render_template('admin_login.html', password='False')
			elif result["message"] == "Wrong Account Details":
				return render_template('admin_login.html', username='False')
			elif result["message"] == "Unauthorized":
				session.permanent = True
				session['api_session_token'] = result["token"]
				session['role'] = result["role"]
				session['user_id'] = result["user_id"]
				return redirect(url_for('user_home', auth='False'))
			else:
				return render_template('admin_login.html')

#Login page for creators
@app.route("/creator/login", methods=["GET","POST"])
def creator_login():
	if request.method == "GET":
		return render_template("creator_login.html", login=request.args.get('login'))
	elif request.method == "POST":
		result = requests.post(url="http://127.0.0.1:5000/api/creator/login", data={"username": request.form["username"], "password": request.form["password"]}).json()
		#Add creator's auth token and role to session if credentials are correct
		if (result["status_code"] == 200):
			session.permanent = True
			session['api_session_token'] = result["token"]
			session['role'] = result["role"]
			session['user_id'] = result["user_id"]
			
			try:
				session['creator_id'] = result["creator_id"]
			except:
				pass
			return redirect(url_for('creator_home'))
		else:
			#Error handling in case of incorrect credentials
			if result["message"] == "Incorrect Password":
				return render_template('creator_login.html', password='False')
			elif result["message"] == "Wrong Account Details":
				return render_template('creator_login.html', username='False')
			else:
				return redirect(url_for('creator_home'))

@app.route("/creator/signup", methods=["GET","POST"])
@access_required(role="User")
@require_api_token
def creator_signup():
	if request.method == "GET":
		return render_template("creator_signup.html", auth=request.args.get('auth'))
	elif request.method == "POST":
		profile = request.files['profile']
		seq = Sqlite_sequence.query.get("artist").seq
		filename = str(seq+1) + ".jpeg"
		if profile:
			path = f"C:/music_streaming_app/static/creator_profiles/{filename}"
			profile.save(path)

		if not path:
			path = None

		result = requests.post(url="http://127.0.0.1:5000/api/creator/signup", data={"artist_name": request.form["artist_name"], "password": request.form["password"], "user_id": session.get("user_id"), "profile":path}).json()
		
		#Add creator's auth token and role to session if credentials are correct
		if (result["status_code"] == 200):
			session['role'] = result["role"]
			session['creator_id'] = result["creator_id"]
			return redirect(url_for('creator_home'))
		else:
			#Error handling in case of incorrect credentials
			if result["message"] == "Incorrect Password":
				session['role'] = result["role"]
				session['creator_id'] = result["creator_id"]
				return render_template('creator_signup.html', password='False')
			elif result["message"] == "Already Logged In":
				return redirect(url_for("creator_login", auth='False'))
			else:
				return render_template('creator_signup.html')

@app.route("/creator", methods=["GET","POST"])
@access_required(role="Creator")
@require_api_token
def creator_home():
	if request.method == "GET":
		result = requests.get(url="http://127.0.0.1:5000/api/creator", data={"user_id": session.get("user_id"), "token": session.get("api_session_token"), "role": session.get("role")}).json()
		if result["message"] == "No Albums":
			return render_template("new_creator_home.html", auth=request.args.get('auth'))
		else:
			if not session.get("creator_id"):
				session['creator_id'] = db.session.query(Artist).with_entities(Artist.artist_id).filter(Artist.user_id==session.get("user_id")).first()[0]

			songs_1 = db.session.query(Song, Album).add_columns(Song.song_name, Song.song_id, Song.lyrics).filter(Album.artist_id==session.get("creator_id"), Song.album_id==Album.album_id)
			songs_2 = db.session.query(Song).filter(or_(Song.collaborator_1==session.get("creator_id"),Song.collaborator_2==session.get("creator_id"), Song.collaborator_3==session.get("creator_id"),Song.collaborator_4==session.get("creator_id")))

			avg_rating_1=db.session.query(Song, Album).with_entities(func.avg(Song.rating).label('average')).filter(Album.artist_id==session.get("creator_id"), Song.album_id==Album.album_id).first()[0]
			avg_rating_2=db.session.query(Song, Album).with_entities(func.avg(Song.rating).label('average')).filter(or_(Song.collaborator_1==session.get("creator_id"), Song.album_id==Album.album_id, Song.collaborator_2==session.get("creator_id"), Song.album_id==Album.album_id, Song.collaborator_3==session.get("creator_id"), Song.album_id==Album.album_id, Song.collaborator_4==session.get("creator_id"), Song.album_id==Album.album_id)).first()[0]

			nums=[]

			total_albums = db.session.query(Album).filter(Album.artist_id==session.get("creator_id")).count()
			total_songs=songs_1.count()+songs_2.count()

			for i in [avg_rating_1, avg_rating_2]:
				if i != None:
					nums.append(i)

			if nums != []:
				avg_rating=mean(nums)

			if 'avg_rating' not in locals():
				avg_rating = "-"

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

			songs_1 = db.session.query(Song, Album).add_columns(Song.song_name, Song.song_id, Song.lyrics).filter(Album.artist_id==session.get("creator_id"), Song.album_id==Album.album_id)
			songs_2 = db.session.query(Song).filter(or_(Song.collaborator_1==session.get("creator_id"),Song.collaborator_2==session.get("creator_id"), Song.collaborator_3==session.get("creator_id"),Song.collaborator_4==session.get("creator_id")))

			r = make_response(render_template("creator_home.html", total_songs=total_songs, avg_rating=avg_rating, total_albums=total_albums, songs_1=songs_1.all(), songs_2=songs_2.all(), auth=request.args.get('auth')))
			r.headers.set('Cache-Control', "no-store")
			r.headers.set('Cache-Control', "no-cache")
			r.headers.set('X-UA-Compatible', 'IE=Edge,chrome=1')
			r.headers.set('Cache-Control', 'public, max-age=0')
			return r

@app.route("/creator/song", methods=["GET","POST"])
@access_required(role="Creator")
@require_api_token
def upload_song():
	if request.method == "GET":
		artists = db.session.query(Artist).filter(Artist.artist_id!=session.get("creator_id")).all()
		count = db.session.query(Artist).filter(Artist.artist_id!=session.get("creator_id")).count()
		albums = db.session.query(Album).filter(Album.artist_id==session.get("creator_id")).all()
		genres = db.session.query(Genre).all()
		return render_template("upload_song.html", artists=artists, count=count, albums=albums, genres=genres)

	if request.method == "POST":
		audio = request.files['audio']
		seq = Sqlite_sequence.query.get("song").seq
		filename = str(seq+1) + ".mp3"
		path = f"C:/music_streaming_app/static/audio/{filename}"
		audio.save(path)
		result = requests.post(url="http://127.0.0.1:5000/api/creator/song", data={"token": session.get("api_session_token"), "creator_id": session.get("creator_id"), "role": session.get("role"), "song_name": request.form["song_name"], "album_id": request.form.get("album_id"), "lyrics": request.form["lyrics"], "genre": request.form.get("genre"), "duration": str(request.form["minutes"])+"m "+str(request.form["seconds"])+"s", "date_added": datetime.today().strftime('%d-%m-%Y'), "audio": path, "collaborator_1": request.form.get("artist_id_1"), "collaborator_2": request.form.get("artist_id_2"), "collaborator_3": request.form.get("artist_id_3"), "collaborator_4": request.form.get("artist_id_4")}).json()

		if (result["status_code"] == 200):
			return redirect(url_for('creator_home'))
		else:
			#Error handling in case song name already exists
			return render_template('upload_song.html', uniq="False")

@app.route("/creator/song/<int:song_id>/delete", methods=["GET","POST"])
@access_required(role="Creator")
@require_api_token
def delete_song(song_id):
	if request.method == "POST":
		result = requests.delete(url="http://127.0.0.1:5000/api/creator/song", data={"token": session.get("api_session_token"), "role": session.get("role"), "song_id": song_id}).json()
		if result["status_code"] == 200:
			return redirect("/creator")

@app.route("/creator/song/<int:song_id>/edit", methods=["GET","POST"])
@access_required(role="Creator")
@require_api_token
def edit_song(song_id):
	if request.method == "GET":
		curr_song = Song.query.get(song_id)
		artists = db.session.query(Artist).filter(Artist.artist_id!=session.get("creator_id")).all()
		count = db.session.query(Artist).filter(Artist.artist_id!=session.get("creator_id")).count()
		albums = db.session.query(Album).filter(Album.artist_id==session.get("creator_id")).all()
		genres = db.session.query(Genre).all()

		test_str=(curr_song.duration).replace("m ","*")
		test_str=test_str.replace("s","*")
		re=test_str.split("*")
		seconds=re[1]
		minutes = (curr_song.duration)[:1]
		return render_template("edit_song.html", artists=artists, count=count, albums=albums, genres=genres, curr_song=curr_song, minutes=minutes, seconds=seconds)

	if request.method == "POST":
		audio = request.files['audio']
		filename = str(song_id) + ".mp3"
		path = f"C:/music_streaming_app/static/audio/{filename}"
		if audio:
			try:
				os.remove(path)
			except:
				pass
			audio.save(path)
		if not audio:
			os.rename(request.form['old_audio'], path, src_dir_fd=None, dst_dir_fd=None)
		result = requests.put(url="http://127.0.0.1:5000/api/creator/song", data={"token": session.get("api_session_token"), "creator_id": session.get("creator_id"), "role": session.get("role"), "song_id": song_id, "song_name": request.form["song_name"], "album_id": request.form.get("album_id"), "lyrics": request.form["lyrics"], "genre": request.form.get("genre"), "duration": str(request.form["minutes"])+"m "+str(request.form["seconds"])+"s", "date_added": datetime.today().strftime('%d-%m-%Y'), "audio": path, "collaborator_1": request.form.get("artist_id_1"), "collaborator_2": request.form.get("artist_id_2"), "collaborator_3": request.form.get("artist_id_3"), "collaborator_4": request.form.get("artist_id_4")}).json()

		if (result["status_code"] == 200):
			return redirect(url_for('creator_home'))
		else:
			#Error handling in case song name already exists
			return render_template('edit_song.html', uniq="False")

@app.route("/creator/song/<int:song_id>/lyrics", methods=["GET","POST"])
@access_required(role="Creator")
@require_api_token
def view_lyrics(song_id):
	if request.method == "GET":
		song = Song.query.get(song_id)
		return render_template('view_lyrics.html', song=song)

@app.route("/creator/album", methods=["GET","POST"])
@access_required(role="Creator")
@require_api_token
def create_album():
	if request.method == "GET":
		return render_template("create_album.html")

	if request.method == 'POST':
		image = request.files['image']
		seq = Sqlite_sequence.query.get("album").seq
		filename = str(seq+1) + ".jpeg"
		path = f"C:/music_streaming_app/static/images/{filename}"
		image.save(path)
		result = requests.post(url="http://127.0.0.1:5000/api/creator/album", data={"token": session.get("api_session_token"), "role": session.get("role"), "user_id": session.get("user_id"), "album_name": request.form["album_name"], "artist_id": session.get("creator_id"), "album_image": path, "language": request.form["language"]}).json()

		if (result["status_code"] == 200):
			return redirect(url_for('upload_song'))
		else:
			#Error handling in case album name already exists
			return render_template('create_album.html', uniq="False")

@app.route("/creator/collabs", methods=["GET","POST"])
@access_required(role="Creator")
@require_api_token
def collaboration_requests():
	if request.method == "GET":
		print(request.args.get("full"))
		received_collabs = db.session.query(Pending_collabs, Song, Artist).with_entities(Pending_collabs.collab_id ,Pending_collabs.collab_requester, Pending_collabs.collab_receiver, Pending_collabs.song_id, Song.song_name, Artist.artist_name).filter(and_(Pending_collabs.collab_receiver==session.get("creator_id"), Song.song_id==Pending_collabs.song_id, Pending_collabs.collab_requester==Artist.artist_id)).all()
		sent_collabs = db.session.query(Pending_collabs, Song, Artist).with_entities(Pending_collabs.collab_id ,Pending_collabs.collab_requester, Pending_collabs.collab_receiver, Pending_collabs.song_id, Song.song_name, Artist.artist_name).filter(and_(Pending_collabs.collab_requester==session.get("creator_id"), Song.song_id==Pending_collabs.song_id, Pending_collabs.collab_receiver==Artist.artist_id)).all()
		return render_template("collab_requests.html", received_collabs=received_collabs, sent_collabs=sent_collabs, full=request.args.get("full"))

@app.route("/creator/collabs/<int:collab_id>", methods=["GET","POST"])
@access_required(role="Creator")
@require_api_token
def collaboration_action(collab_id):
	if request.method == "POST":
		result = requests.post(url="http://127.0.0.1:5000/api/creator/collaboration", data={"token": session.get("api_session_token"), "role": session.get("role"), "collab_id": collab_id, "action": request.form['action']}).json()
		if (result["status_code"] == 200):
			return redirect(url_for('collaboration_requests'))

		if (result["status_code"] == 401):
			return redirect(url_for('collaboration_requests', full="True"))

@app.route("/creator/collab/<int:song_id>/delete", methods=["GET","POST"])
@access_required(role="Creator")
@require_api_token
def delete_collab(song_id):
	if request.method == "GET":
		result = requests.delete(url="http://127.0.0.1:5000/api/creator/collaboration", data={"token": session.get("api_session_token"), "role": session.get("role"), "creator_id": session.get("creator_id"), "song_id": song_id}).json()

		if (result["status_code"] == 200):
				return redirect(url_for('creator_home'))

@app.route("/creator/album/manage", methods=["GET","POST"])
@access_required(role="Creator")
@require_api_token
def manage_albums():
	if request.method == "GET":
		albums = db.session.query(Album).filter(Album.artist_id==session.get("creator_id"))
		return render_template("manage_albums.html", albums=albums.all())

@app.route("/creator/album/<int:album_id>/edit", methods=["GET","POST"])
@access_required(role="Creator")
@require_api_token
def edit_album(album_id):
	if request.method == "GET":
		album = Album.query.get(album_id)
		album_image = ((album.album_image).rsplit('.',-1))[-1]
		album_image = (album.album_name)+"."+album_image
		return render_template("edit_album.html", album=album, album_image=album_image)

	if request.method == "POST":
		album = Album.query.get(album_id)
		image = request.files['image']
		filename = str(album_id) + ".jpeg"
		path = f"C:/music_streaming_app/static/images/{filename}"
		if image:
			try:
				os.remove(path)
			except:
				pass
			image.save(path)
		if not image:
			os.rename(request.form['old_album_image'], path, src_dir_fd=None, dst_dir_fd=None)	
		result = requests.put(url="http://127.0.0.1:5000/api/creator/album", data={"token": session.get("api_session_token"), "role": session.get("role"), "album_name": request.form["album_name"], "artist_id": session.get("creator_id"), "album_image": path, "album_id":album_id, "language": request.form["language"], "playlist_id": album.playlist_id}).json()

		if (result["status_code"] == 200):
			return redirect(url_for('manage_albums'))
		else:
			#Error handling in case album name already exists
			return render_template('edit_album.html', uniq="False")

@app.route("/creator/album/<int:album_id>/delete", methods=["GET","POST"])
@access_required(role="Creator")
@require_api_token
def delete_album(album_id):
	if request.method == "POST":
		result = requests.delete(url="http://127.0.0.1:5000/api/creator/album", data={"token": session.get("api_session_token"), "role": session.get("role"), "album_id": album_id}).json()
		if result["status_code"] == 200:
			return redirect("/creator")

@app.route("/creator/profile", methods=["GET","POST"])
@access_required(role="Creator")
@require_api_token
def creator_profile():
	if request.method == "GET":
		creator = Artist.query.get(session.get("creator_id"))
		creator_profile = creator.profile

		if creator_profile:
			creator_profile = creator_profile.replace("C:/music_streaming_app", "..")
		if not creator.profile:
			creator_profile = "../static/creator_profiles/default.jpeg"

		songs = db.session.query(Song, Album).with_entities(Song.plays, Song.song_id).filter(or_(and_(Album.artist_id==session.get("creator_id"), Song.album_id==Album.album_id), Song.collaborator_1==session.get("creator_id"),Song.collaborator_2==session.get("creator_id"), Song.collaborator_3==session.get("creator_id"),Song.collaborator_4==session.get("creator_id")))
		top_songs = db.session.query(Song, Album).with_entities(Song.song_id, Song.song_name, Song.plays, Song.duration, Album.album_id).filter(or_(Album.artist_id==session.get("creator_id"), Song.album_id==Album.album_id, Song.collaborator_1==session.get("creator_id"),Song.collaborator_2==session.get("creator_id"), Song.collaborator_3==session.get("creator_id"),Song.collaborator_4==session.get("creator_id"))).order_by(Song.plays.desc()).limit(5)

		plays=0

		for song in songs.all():
			if song.plays != None:
				plays += song.plays
		
		return render_template("creator_profile.html", creator=creator, creator_profile=creator_profile, plays=plays, songs=top_songs)

@app.route("/creator/profile/update", methods=["GET","POST"])
@access_required(role="Creator")
@require_api_token
def update_profile():
	if request.method == "GET":
		creator = Artist.query.get(session.get("creator_id"))

		profile = ((creator.profile).rsplit('.',-1))[-1]
		profile = (creator.artist_name)+"."+profile

		return render_template("update_creator_profile.html", creator=creator, profile=profile)

	if request.method == "POST":
		profile = request.files['profile']
		filename = str(session.get("creator_id")) + ".jpeg"
		path = f"C:/music_streaming_app/static/creator_profiles/{filename}"

		print(request.form["artist_name"])
		print(session.get("creator_id"))
		if profile:
			try:
				os.remove(path)
			except:
				pass
			profile.save(path)
		if not profile:
			os.rename(request.form['old_profile'], path, src_dir_fd=None, dst_dir_fd=None)	
		result = requests.put(url="http://127.0.0.1:5000/api/creator/signup", data={"token": session.get("api_session_token"), "role": session.get("role"), "artist_name": request.form["artist_name"], "creator_id": session.get("creator_id"), "profile": path}).json()

		if (result["status_code"] == 200):
			return redirect(url_for('creator_profile'))

@app.route("/user", methods=["GET","POST"])
@access_required(role="User")
@require_api_token
def user_home():
	top_songs = db.session.query(Song).order_by(Song.plays_this_week.desc()).limit(1)[0]

	genre_playlists = {"p_1": "Pop Shots", "p_2": "Jazz Journeys", "p_3": "Rock Rhythms", "p_4": "Hip Hop Hustle", 'p_5': 'R&B Reflections', 'p_6': 'Metal Mayhem', 'p_7': 'Country Crossroads', 'p_8': 'Electronic Escapes', 'p_9': 'Folk Fables', 'p_10': 'Acoustic Adventures', 'p_11': 'Classical Crescendos', 'p_12': 'Blue Ballads'}
	con = {}

	for i in genre_playlists:
		try:
			temp = i[2:]
			con[i] = db.session.query(Song).filter(Song.genre==temp).order_by(Song.plays_this_week.desc()).limit(1)[0]
		except:
			con[i] = None

	top_albums = db.session.query(Song, Album).with_entities(Album.album_id, Album.album_name).filter(Song.album_id == Album.album_id).order_by(Song.plays_this_week.desc()).distinct()
	top_artists = db.session.query(Song, Album, Artist).with_entities(Album.artist_id, Artist.artist_name).filter(Song.album_id == Album.album_id, Album.artist_id == Artist.artist_id).order_by(Song.plays_this_week.desc()).distinct()

	try:
		hot_hindi = db.session.query(Song, Album).filter(Song.album_id == Album.album_id, Album.language == "Hindi").order_by(Song.plays_this_week.desc()).limit(1)[0][1]
	except:
		hot_hindi = None

	try:
		eclectic_english = db.session.query(Song, Album).filter(Song.album_id == Album.album_id, Album.language == "English").order_by(Song.plays_this_week.desc()).limit(1)[0][1]
	except:
		eclectic_english = None

	try:
		sizzling_spanish = db.session.query(Song, Album).filter(Song.album_id == Album.album_id, Album.language == "Spanish").order_by(Song.plays_this_week.desc()).limit(1)[0][1]
	except:
		sizzling_spanish = None

	playlist_history = db.session.query(Playlist, Playlist_history).filter(Playlist_history.user_id==session.get("user_id"), Playlist.playlist_id==Playlist_history.playlist_id).all()
	albums = db.session.query(Album)
	songs = db.session.query(Song)
	
	album_playlists = []
	albums_list = []

	for album in albums:
		album_playlists.append(album.playlist_id)

	song_playlists = {}
	phist = db.session.query(Playlist_history, Playlist_content).filter(Playlist_history.user_id==session.get("user_id"), Playlist_history.playlist_id==Playlist_content.playlist_id)
	for i in phist:
		if i[0].playlist_id in song_playlists:
			pass
		else:
			song_playlists[i[0].playlist_id] = i[1].song_id

	for i in list(song_playlists):
		if i in album_playlists:
			song_playlists.pop(i, None)

	psongs = list(song_playlists.values())
	print(psongs)

	playlists = db.session.query(Playlist)
	for p in list(song_playlists):
		for playlist in playlists:
			if p == playlist.playlist_id:
				temp = song_playlists.pop(playlist.playlist_id)
				song_playlists[temp] = playlist.playlist_name

	return render_template("user_home.html", top_song=top_songs, con=con, playlist_names=genre_playlists, top_albums=top_albums, top_artists=top_artists, hot_hindi=hot_hindi, eclectic_english=eclectic_english, sizzling_spanish=sizzling_spanish, playlist_history=playlist_history, songs=songs, albums=albums, song_playlists=song_playlists, psongs=psongs)

@app.route("/log-out", methods=["GET","POST"])
@require_api_token
def logout():
	if request.method == "GET":
		if session['role'] == 'Creator':
			session.clear()
			return redirect(url_for('creator_login'))

		if session['role'] == 'Admin':
			session.clear()
			return redirect(url_for('admin_login'))

		if session['role'] == 'User':
			session.clear()
			return redirect(url_for('user_login'))