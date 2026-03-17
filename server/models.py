from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import relationship
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()


class BaseModel(db.Model):
    """
        Abstract base model to provide shared functionality across all entities.
        Includes primary key and a shorthand save method.
        """
    __abstract__ = True  # חשוב! אומר לשרת לא ליצור טבלה בשם BaseModel, היא רק לצורך הורשה.
    id = db.Column(db.Integer, primary_key=True)

    def save(self):
        """Persists the current instance to the database."""
        db.session.add(self)
        db.session.commit()


# --- Entities ---
class User(BaseModel):
    """Represents a system user with authentication and role management."""
    __tablename__ = 'users'

    username = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(50), default='user', nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    profile_image = db.Column(db.String(255), nullable=True)

    # Relationship: Recipes uploaded by the user
    recipes = relationship("Recipe", backref="uploader", lazy=True)

    def set_password(self, password):
        """Hashes and sets the user's password."""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """Verifies the password against the stored hash."""
        return check_password_hash(self.password_hash, password)


class Recipe(BaseModel):
    """Represents a culinary recipe and its associated metadata."""
    __tablename__ = 'recipes'

    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    instructions = db.Column(db.Text, nullable=False)
    prep_time = db.Column(db.Integer, nullable=False)
    kosher_type = db.Column(db.String(20), nullable=False)
    difficulty = db.Column(db.String(20), nullable=False)
    rating = db.Column(db.Float, default=0.0)
    original_image_path = db.Column(db.String(255))
    variation_paths = db.Column(db.Text)

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))

    # Relationship: Ingredients related to the recipe
    ingredients = relationship("IngredientEntry", backref="recipe", lazy='dynamic', cascade="all, delete-orphan")


class IngredientEntry(BaseModel):
    """Represents a single ingredient line item (e.g., '2 cups of flour')."""
    __tablename__ = 'ingredient_entries'

    recipe_id = db.Column(db.Integer, db.ForeignKey('recipes.id'))
    product_name = db.Column(db.String(100), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    unit = db.Column(db.String(50), nullable=False)


class RoleRequest(BaseModel):
    """Manages user requests for privilege escalation (e.g., to Editor)."""
    __tablename__ = 'role_requests'

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.String(20), default='pending', nullable=False)  # pending/approved/rejected
    request_date = db.Column(db.DateTime, default=db.func.now())

    user = db.relationship('User', backref=db.backref('role_requests', cascade="all, delete-orphan"))
