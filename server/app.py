import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from models import db, User, Recipe, RoleRequest
from routes.recipes import recipes_bp
from routes.auth import auth_bp
from datetime import timedelta

app = Flask(__name__)

# --- App Configuration ---
# TODO: In production, move JWT_SECRET_KEY to environment variables (.env)
app.config['JWT_SECRET_KEY'] = 'sUp3R_S3cR3T_k3y_f0R_y0ur_R3c1p3_4pP_2025'
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=30)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///recipes.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# --- Extensions Initialization ---
jwt = JWTManager(app)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:4200"}})
db.init_app(app)

# --- Blueprints Registration ---
app.register_blueprint(recipes_bp, url_prefix='/api')
app.register_blueprint(auth_bp, url_prefix='/api')


# --- Static Routes for Uploads ---
@app.route('/uploads/profiles/<path:filename>')
def get_profile_file(filename):
    """Serve profile images from the local uploads directory."""
    return send_from_directory(os.path.join('uploads', 'profiles'), filename)


@app.route('/uploads/recipes/<path:filename>')
def get_recipe_file(filename):
    """Serve recipe images from the local uploads directory."""
    return send_from_directory(os.path.join('uploads', 'recipes'), filename)


# --- Database Initialization ---
def initialize_db_with_data():
    """Creates database tables and ensures the master admin account exists."""
    with app.app_context():
        db.create_all()

        my_admin_email = "y0527187734@gmail.com"
        my_admin_password = "215898255"

        user = User.query.filter_by(email=my_admin_email).first()

        if user:
            user.set_password(my_admin_password)
            user.role = 'admin'
            user.save()
        else:
            admin = User(username='Admin', email=my_admin_email, role='admin')
            admin.set_password(my_admin_password)
            admin.save()
            print(f"New ADMIN created: {my_admin_email}")


# --- Entry Point ---
if __name__ == '__main__':
    initialize_db_with_data()
    app.run(debug=True, port=5000)
