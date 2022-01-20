import os

import click
from flask import Flask, render_template
from flask_sqlalchemy import SQLAlchemy
from flask.cli import with_appcontext

from config import Config

# init globally accessible libraries
db = SQLAlchemy()

def create_app(test_config=None):
    """Create and configure an instance of the Flask application."""
    app = Flask(__name__,
        instance_relative_config=True,
        static_url_path='', 
        static_folder='static',
        template_folder='templates')

    # load the default config
    app.config.from_object(Config)

    if test_config is None:
        # load the instance config, if it exists, when not testing
        app.config.from_pyfile("config.py", silent=True)
    else:
        # load the test config if passed in
        app.config.update(test_config)

    if os.environ.get('SQLALCHEMY_AZURE_MYSQL_HOST') is not None:
        app.config.update(
            SQLALCHEMY_DATABASE_URI = 'mysql://' + os.environ.get('SQLALCHEMY_AZURE_MYSQL_USER') + ':' + os.environ.get('SQLALCHEMY_AZURE_MYSQL_PASS') + '@' + os.environ.get('SQLALCHEMY_AZURE_MYSQL_HOST') + ':3306/' + os.environ.get('SQLALCHEMY_AZURE_MYSQL_DB') + '?ssl_ca=BaltimoreCyberTrustRoot.crt.pem'
        )

    # ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    @app.route("/hello")
    def hello():
        return "Hello, World!"
        
    @app.route("/privacy")
    def privacy():
        return render_template('privacy.html')

    db.init_app(app)

    # perform setup checks
    with app.app_context():
        from .utils import dataset_utils
        dataset_utils.load_files()

    @app.context_processor
    def inject_datasets():
        from adifa import models
        from sqlalchemy import asc
        return {'datasets': models.Dataset.query.filter_by(published=1).order_by(asc(models.Dataset.title)).all()}

    # apply the blueprints to the app
    from adifa import api, datasets 

    app.register_blueprint(datasets.bp)
    app.register_blueprint(api.bp,
        url_prefix='{prefix}/v{version}'.format(
            prefix=app.config['API_PREFIX'],
            version=app.config['API_VERSION']))


    @click.command("init-db")
    @with_appcontext
    def init_db_command():
        """Clear existing data and create new tables."""
        db.create_all()
        click.echo("Initialized the database.")

    @click.command("autodiscover")
    @with_appcontext
    def autodiscover_command():
        from .utils import dataset_utils
        dataset_utils.auto_discover()
        click.echo("Discovered Datasets.")

    app.cli.add_command(init_db_command)
    app.cli.add_command(autodiscover_command)

    return app