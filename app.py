import os
import sys
from flask import Flask, request, url_for, flash, render_template, redirect, send_from_directory
from flask import current_app as app
from application.models import User, Album, Creator, Genre, Playlist, Role, Playlist_content, Song
from application.database import db
from sqlalchemy import select, update, delete, values, func, exc, text
from application import config
from application.config import LocalDevelopmentConfig, MailConfig
from application.database import db
from flask_cors import CORS
from flask_hashing import Hashing
import logging
from flask_security import Security, SQLAlchemySessionUserDatastore, SQLAlchemyUserDatastore
from flask_restful import Resource, Api
from celery import Celery
from celery.schedules import crontab
from flask_mail import Mail, Message
import pandas as pd
import matplotlib.pyplot as plt

app = None
api = None

def create_app():
	app = Flask(__name__, template_folder="templates")
	if os.getenv('ENV', 'development') == 'production':
		raise Exception("Currently no production config is setup.")
	else:
		print("Starting Local Development")
		app.config.from_object(LocalDevelopmentConfig)
	db.init_app(app)
	api = Api(app)
	app.app_context().push()
	mail = Mail(app)
	app.config.from_object(MailConfig)
	mail = Mail(app)
	user_datastore = SQLAlchemySessionUserDatastore(db.session, User, Role)
	security = Security(app, user_datastore)
	return app, api, mail

app, api, mail = create_app()
CORS(app, resources={r"/api/*": {"origins": "*"}})
hashing = Hashing(app)

celery = Celery(app, broker='redis://localhost:6379', backend='redis://localhost:6379')
celery.conf.timezone = 'Asia/Kolkata'

@celery.task
def set_active():
    users = User.query.all()
    for user in users:
    	user.active = False
    db.session.commit()

@celery.task
def reset_plays_weekly():
    songs = Song.query.all()
    for song in songs:
    	song.plays_last_week = song.plays_this_week
    	song.plays_this_week = 0
    db.session.commit()

@celery.task
def reset_plays_monthly():
    songs = Song.query.all()
    for song in songs:
    	song.plays_this_month = 0
    db.session.commit()

@celery.task
def send_inactive_users_email():
    inactive_users = db.session.query(User).join(Role.users).filter(and_(User.active == False, Role.id == 2)).all()
    recipients = [user.email for user in inactive_users]
    msg = Message("🎵 Time to Dive Back into Your Favorite Tunes! 🎶", sender = '21f1001736@ds.study.iitm.ac.in', recipients=recipients)
    msg.body = '''
Hey there,

Missing the beats? Your playlist is waiting!

We noticed you haven't been around lately, and we're here to make sure you don't miss out on all the amazing jams waiting for you. 🎧

Whether you're into chart-topping hits, underground bangers, or soothing melodies, we've got just the right vibe for you.

So kick back, relax, and let the music take you on a journey. 🚀

Log in now and groove to the rhythm of your favorite tracks!

Catch you on the flip side!

Cheers,
Harmonix'''

    mail.send(msg)

@celery.task
def send_report():
	creators = Creator.query.all()
	for creator in creators:
		#Get the user entry of the current creator
		user = db.session.query(User).filter(User.id==creator.user_id).first()

		#Get the total number of songs and albums
		total_songs = db.session.query(Album, Song).filter(Album.album_id==Song.album_id, or_(Album.creator_id==creator.creator_id, Song.collaborator_1==creator.creator_id, Song.collaborator_2==creator.creator_id, Song.collaborator_3==creator.creator_id, Song.collaborator_4==creator.creator_id)).count()
		total_albums = db.session.query(Album).filter(Album.creator_id==creator.creator_id).count()

		#Get the month number of last month
		last_month = datetime.now() - timedelta(days=5)
		month = str(last_month.month)
		if len(month) == 1:
			month = '0' + month

		month_text = last_month.strftime('%B %Y')

    	#Get all the songs released in the last month
		songs_released = db.session.query(Album, Song).filter(Album.album_id==Song.album_id, or_(Album.creator_id==creator.creator_id, Song.collaborator_1==creator.creator_id, Song.collaborator_2==creator.creator_id, Song.collaborator_3==creator.creator_id, Song.collaborator_4==creator.creator_id), func.substr(Song.date_added, 4, 2)==month).all()
		total_plays = db.session.query(func.sum(Song.plays)).join(Album).filter(Album.album_id==Song.album_id, or_(Album.creator_id==creator.creator_id, Song.collaborator_1==creator.creator_id, Song.collaborator_2==creator.creator_id, Song.collaborator_3==creator.creator_id, Song.collaborator_4==creator.creator_id)).scalar()
		top_rated_songs = db.session.query(Album, Song).filter(Album.album_id==Song.album_id, or_(Album.creator_id==creator.creator_id, Song.collaborator_1==creator.creator_id, Song.collaborator_2==creator.creator_id, Song.collaborator_3==creator.creator_id, Song.collaborator_4==creator.creator_id)).order_by(Song.rating.desc()).limit(5).all()
		most_played_song = db.session.query(Album, Song).filter(Album.album_id==Song.album_id, or_(Album.creator_id==creator.creator_id, Song.collaborator_1==creator.creator_id, Song.collaborator_2==creator.creator_id, Song.collaborator_3==creator.creator_id, Song.collaborator_4==creator.creator_id)).order_by(Song.plays.desc()).limit(1).first()
		most_played_album = db.session.query(Album, Song, func.sum(Song.plays)).filter(Album.album_id==Song.album_id, Album.creator_id==creator.creator_id).group_by(Album.album_id).order_by(Song.plays.desc()).limit(1).first()
		
		temp = db.session.query(Album, Song).filter(Album.album_id==Song.album_id, Album.creator_id==creator.creator_id, func.substr(Song.date_added, 4, 2)==month).all()
		collaborations_initiated = 0
		for song in temp:
			if song[1].collaborator_1 != None:
				collaborations_initiated += 1
			if song[1].collaborator_2 != None:
				collaborations_initiated += 1
			if song[1].collaborator_3 != None:
				collaborations_initiated += 1
			if song[1].collaborator_4 != None:
				collaborations_initiated += 1

		collaborations_accepted = db.session.query(Song).filter(or_(Song.collaborator_1==creator.creator_id, Song.collaborator_2==creator.creator_id, Song.collaborator_3==creator.creator_id, Song.collaborator_4==creator.creator_id), func.substr(Song.date_added, 4, 2)==month).count()
		
		all_songs = db.session.query(Song.song_name, Song.plays).join(Album).filter(or_(Album.creator_id==creator.creator_id, Song.collaborator_1==creator.creator_id, Song.collaborator_2==creator.creator_id, Song.collaborator_3==creator.creator_id, Song.collaborator_4==creator.creator_id)).all()
		df = pd.DataFrame(all_songs, columns=['song_name', 'plays'])

		msg = Message("Monthly Creator Report", sender = '21f1001736@ds.study.iitm.ac.in', recipients=[user.email])

		if not df.empty:
			plt.figure(figsize=(8, 8))
			plt.pie(df['plays'], labels=df['song_name'], autopct='%1.1f%%', startangle=140)
			plt.get_cmap('plasma')
			plt.title('Plays Distribution by Song')
			plt.savefig('static/charts/report-pie.jpeg')

			plt.figure(figsize=(10, 6))
			plt.bar(df['song_name'], df['plays'])
			plt.get_cmap('plasma')
			plt.title('Top Songs')
			plt.xlabel('Song')
			plt.ylabel('Number of Plays')
			plt.xticks(rotation=45)
			plt.tight_layout()
			plt.savefig('static/charts/report-bar.jpeg')

			with open('static/charts/report-bar.jpeg', 'rb') as fp:
				msg.attach('report-bar.jpeg', 'image/jpeg', fp.read(), 'inline', headers=[['Content-ID','<bar-chart>']])

			with open('static/charts/report-pie.jpeg', 'rb') as fp:
				msg.attach('report-pie.jpeg', 'image/jpeg', fp.read(), 'inline', headers=[['Content-ID','<pie-chart>']])

		msg.html = render_template("report.html", month=month_text, creator_name=creator.creator_name, total_songs=total_songs, total_albums=total_albums, songs_released=songs_released, total_plays=total_plays, top_rated_songs=top_rated_songs, most_played_song=most_played_song, most_played_album=most_played_album, collaborations_initiated=collaborations_initiated, collaborations_accepted=collaborations_accepted)

		mail.send(msg)

@celery.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
	sender.add_periodic_task(crontab(hour=0, minute=0), set_active.s(), name='set_active')
	sender.add_periodic_task(crontab(hour=0, minute=0, day_of_week='monday'), reset_plays_weekly.s(), name='reset_plays_weekly')
	sender.add_periodic_task(crontab(hour=17, minute=58), send_report.s(), name='send_report')
	sender.add_periodic_task(crontab(hour=0, minute=0, day_of_month=1), reset_plays_monthly.s(), name='reset_plays_monthly')
	sender.add_periodic_task(crontab(hour=17, minute=0),send_inactive_users_email.s(),name='send_inactive_users_email')

#Import all the controllers so they are loaded
from application.controllers import *

#Add all restful controllers
from application.api import FlagSongAPI, ChangeFlagAPI, AdminSearchAPI, AdminHomeAPI, SearchAPI, IncreasePlaysAPI, UserRatingAPI, PlaylistAPI, TopPlaylistsAPI, UserHomeAPI, UserLoginAPI, UserSignupAPI, AdminLoginAPI, CreatorLoginAPI, CreatorSignupAPI, CreatorHomeAPI, CreateAlbumAPI, UploadSongAPI, ViewLyricsAPI, CollaborationAPI
api.add_resource(UserLoginAPI, "/api/login")
api.add_resource(UserSignupAPI, "/api/signup")
api.add_resource(AdminLoginAPI, "/api/admin/login")
api.add_resource(CreatorLoginAPI, "/api/creator/login")
api.add_resource(CreatorSignupAPI, "/api/creator/signup")
api.add_resource(CreatorHomeAPI, "/api/creator")
api.add_resource(CreateAlbumAPI, "/api/creator/album")
api.add_resource(UploadSongAPI, "/api/creator/song")
api.add_resource(CollaborationAPI, "/api/creator/collaboration")
api.add_resource(ViewLyricsAPI, "/api/song/lyrics")
api.add_resource(UserHomeAPI, "/api/user")
api.add_resource(TopPlaylistsAPI, "/api/user/top_playlists")
api.add_resource(PlaylistAPI, "/api/user/playlist")
api.add_resource(UserRatingAPI, "/api/user/rating")
api.add_resource(IncreasePlaysAPI, "/api/user/plays")
api.add_resource(SearchAPI, "/api/user/search")
api.add_resource(AdminHomeAPI, "/api/admin")
api.add_resource(AdminSearchAPI, "/api/admin/search")
api.add_resource(ChangeFlagAPI, "/api/user/flag")
api.add_resource(FlagSongAPI, "/api/admin/flag")


if __name__ == '__main__':
	#Run the flask app
	app.run(debug = True)