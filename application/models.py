from application.database import db
from flask_security import UserMixin, RoleMixin

roles_users = db.Table('roles_users',
	db.Column('user_id', db.Integer(), db.ForeignKey('user.id')),
	db.Column('role_id', db.Integer(), db.ForeignKey('role.id')))

class User(db.Model, UserMixin):
	__tablename__ = 'user'
	id = db.Column(db.Integer, autoincrement=True, primary_key=True)
	name = db.Column(db.String, nullable=False)
	username = db.Column(db.String, nullable=False, unique=True)
	password = db.Column(db.String, nullable=False)
	email = db.Column(db.String, nullable=False, unique=True)
	phone = db.Column(db.String, nullable=False, unique=True)
	active = db.Column(db.Boolean())
	fs_uniquifier = db.Column(db.String(255), unique=True, nullable=False)
	roles = db.relationship('Role', secondary = roles_users, backref=db.backref('users', lazy='dynamic'))
	view_flagged = db.Column(db.Boolean())

class Role(db.Model, RoleMixin):
	__tablename__ = 'role'
	id = db.Column(db.Integer, primary_key=True)
	name = db.Column(db.String(80), unique=True)
	description = db.Column(db.String(255))

class Album(db.Model):
	__tablename__ = 'album'
	album_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
	album_name = db.Column(db.String, nullable=False)
	creator_id = db.Column(db.Integer, db.ForeignKey("creator.creator_id"), nullable=False)
	album_image = db.Column(db.String, nullable=False)
	language = db.Column(db.String, nullable=False)
	playlist_id = db.Column(db.Integer, db.ForeignKey("playlist.playlist_id"), nullable=False)

class Creator(db.Model):
	__tablename__ = 'creator'
	creator_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
	user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False, unique=True)
	creator_name = db.Column(db.String, nullable=False)
	profile = db.Column(db.String)

class Genre(db.Model):
	__tablename__ = 'genre'
	genre_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
	genre_name = db.Column(db.Integer, nullable=False, unique=True)
	description = db.Column(db.String)

class Playlist(db.Model):
	__tablename__ = 'playlist'
	playlist_id = db.Column(db.Integer, primary_key=True, autoincrement=True, nullable=False)
	user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
	playlist_name = db.Column(db.String, nullable=False)

class Playlist_content(db.Model):
	__tablename__ = 'playlist_content'
	playlist_id = db.Column(db.Integer, db.ForeignKey("playlist.playlist_id"), primary_key=True, nullable=False)
	song_id = db.Column(db.Integer, db.ForeignKey("song.song_id"), primary_key=True, nullable=False)
	
class Song(db.Model):
	__tablename__ = 'song'
	song_id = db.Column(db.Integer, primary_key=True, autoincrement=True, nullable=False)
	song_name = db.Column(db.String, nullable=False)
	album_id = db.Column(db.Integer, db.ForeignKey("album.album_id"), nullable=False)
	lyrics = db.Column(db.String, nullable=False)
	genre = db.Column(db.Integer, db.ForeignKey("genre.genre_id"), nullable=False)
	duration = db.Column(db.String, nullable=False)
	date_added = db.Column(db.String, nullable=False)
	audio = db.Column(db.String, nullable=False)
	plays = db.Column(db.Integer)
	plays_last_week = db.Column(db.Integer)
	plays_this_week = db.Column(db.Integer)
	plays_this_month = db.Column(db.Integer)
	rating = db.Column(db.Float)
	collaborator_1 = db.Column(db.Integer, db.ForeignKey("creator.creator_id"))
	collaborator_2 = db.Column(db.Integer, db.ForeignKey("creator.creator_id"))
	collaborator_3 = db.Column(db.Integer, db.ForeignKey("creator.creator_id"))
	collaborator_4 = db.Column(db.Integer, db.ForeignKey("creator.creator_id"))
	flag = db.Column(db.String)

class Pending_collabs(db.Model):
	__tablename__ = 'pending_collabs'
	collab_id = db.Column(db.Integer, primary_key=True, autoincrement=True, nullable=False)
	collab_requester = db.Column(db.Integer, db.ForeignKey("creator.creator_id"), nullable=False)
	collab_receiver = db.Column(db.Integer, db.ForeignKey("creator.creator_id"), nullable=False)
	song_id = db.Column(db.Integer, nullable=False)

class Playlist_history(db.Model):
	__tablename__ = 'playlist_history'
	user_id = db.Column(db.Integer, db.ForeignKey("user.id"), primary_key=True, nullable=False)
	playlist_id = db.Column(db.Integer, db.ForeignKey("playlist.playlist_id"), primary_key=True, nullable=False)
	date = db.Column(db.String, nullable=False)

class Song_history(db.Model):
	__tablename__ = 'song_history'
	song_history_id = db.Column(db.Integer, primary_key=True, nullable=False)
	user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
	song_id = db.Column(db.Integer, db.ForeignKey("song.song_id"), nullable=False)
	date = db.Column(db.String, nullable=False)

class Sqlite_sequence(db.Model):
	__tablename__ = 'sqlite_sequence'
	name = db.Column(db.String, primary_key=True)
	seq = db.Column(db.Integer)
