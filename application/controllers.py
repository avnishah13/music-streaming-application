from flask import Flask, request, url_for, flash, render_template, redirect, session, make_response, send_from_directory
from flask import current_app as app
from application.models import User, Album, Creator, Genre, Playlist, Role, Playlist_content, Song, Pending_collabs, Playlist_history, Song_history, Sqlite_sequence
from application.database import db
from sqlalchemy import select, update, delete, values, func, exc, text, or_, and_
from app import hashing
import logging, requests, os
from functools import wraps
from datetime import datetime, timedelta
from statistics import mean
import phonenumbers as pn 
from phonenumbers import geocoder

@app.route("/")
def home():
	return render_template("index.html")

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_vue_app(path):
    if path.endswith('.vue'):
        return send_from_directory('static', path, mimetype='application/javascript')
    if path != "" and path != "favicon.ico":
        return send_from_directory('static', path)
    else:
        return send_from_directory('static', 'index.html')