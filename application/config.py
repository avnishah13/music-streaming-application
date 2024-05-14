import os
from datetime import timedelta
basedir = os.path.abspath(os.path.dirname(__file__))

class Config():
    DEBUG = False
    SQLITE_DB_DIR = None
    SQLALCHEMY_DATABASE_URI = None
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    WTF_CSRF_ENABLED = False
    SECURITY_TOKEN_AUTHENTICATION_HEADER = "Authentication-Token"

class LocalDevelopmentConfig(Config):
    SQLITE_DB_DIR = os.path.join(basedir, "../db_directory")
    SQLALCHEMY_DATABASE_URI = "sqlite:///" + os.path.join(SQLITE_DB_DIR, "database.sqlite3")
    DEBUG = False
    SECRET_KEY = "23ybioeoejx245n"
    SECURITY_REGISTRABLE = True
    SECURITY_UNAUTHORIZED_VIEW = None
    PERMANENT_SESSION_LIFETIME =  timedelta(minutes=30)

class MailConfig():
    MAIL_SERVER='smtp.gmail.com'
    MAIL_PORT = 465
    MAIL_USERNAME = '21f1001736@ds.study.iitm.ac.in'
    MAIL_PASSWORD = 'getcxxbabcyzhcjy'
    MAIL_USE_TLS = False
    MAIL_USE_SSL = True