
import os
import uuid
import json
from flask import Blueprint, jsonify, request, current_app
from werkzeug.utils import secure_filename
from PIL import Image, ImageFilter
from flask_jwt_extended import jwt_required, get_jwt_identity

from models import Recipe, IngredientEntry, db, User

recipes_bp = Blueprint('recipes', __name__)

@recipes_bp.route('/recipes', methods=['GET'])
def get_all_recipes():
    """Fetch recipes with filtering, searching, and ingredient matching logic."""
    user_ingredients_raw = request.args.get('ingredients', '')
    search_term = request.args.get('search', '')
    kosher_filters = request.args.get('kosher', '')
    difficulty_filters = request.args.get('difficulty', '')
    sort_by = request.args.get('sort_by', 'id')
    order = request.args.get('order', 'asc')

    query = Recipe.query

    # Search and Filter Filtering
    if search_term:
        query = query.filter(Recipe.title.ilike(f'%{search_term}%'))
    if kosher_filters:
        query = query.filter(Recipe.kosher_type.in_(kosher_filters.split(',')))
    if difficulty_filters:
        query = query.filter(Recipe.difficulty.in_(difficulty_filters.split(',')))

    # Primary Sorting
    if sort_by == 'prep_time':
        if order == 'desc':
            query = query.order_by(Recipe.prep_time.desc())
        else:
            query = query.order_by(Recipe.prep_time.asc())
    else:
        query = query.order_by(Recipe.id.desc())

    all_recipes = query.all()
    results = []
    user_ing_list = [i.strip().lower() for i in user_ingredients_raw.split(',') if i.strip()]

    for recipe in all_recipes:
        recipe_ingredients = recipe.ingredients.all()
        total_ingredients_count = len(recipe_ingredients)

        if total_ingredients_count == 0:
            continue

        found_in_recipe = []
        missing_from_user = []

        for ri in recipe_ingredients:
            is_match = any(user_item in ri.product_name.lower() for user_item in user_ing_list)
            if is_match:
                found_in_recipe.append(ri.product_name)
            else:
                missing_from_user.append(ri.product_name)

        match_percent = (len(found_in_recipe) / total_ingredients_count) * 100

        if user_ing_list and match_percent < 10:
            continue

        results.append({
            'id': recipe.id,
            'title': recipe.title,
            'description': recipe.description,
            'prep_time': recipe.prep_time,
            'kosher_type': recipe.kosher_type,
            'difficulty': recipe.difficulty,
            'original_image_path': recipe.original_image_path,
            'missing_ingredients': missing_from_user,
            'match_percent': round(match_percent)
        })

    # Post-query sorting for relevance or time
    if sort_by == 'prep_time':
        results.sort(key=lambda x: x['prep_time'], reverse=(order == 'desc'))
    elif user_ing_list:
        results.sort(key=lambda x: x['match_percent'], reverse=True)

    return jsonify({'success': True, 'recipes': results}), 200

@recipes_bp.route('/recipes', methods=['POST'])
@jwt_required()
def add_recipe():
    """Handles new recipe creation including image processing and variations."""
    try:
        user_id = get_jwt_identity()
        title = request.form.get('title')
        description = request.form.get('description')
        instructions = request.form.get('instructions')
        ingredients_json = request.form.get('ingredients')
        prep_time = request.form.get('prep_time')
        difficulty = request.form.get('difficulty')
        kosher_type = request.form.get('kosher_type')

        image = request.files.get('image')
        if not image:
            return jsonify({"success": False, "error": "לא הועלתה תמונה"}), 400

        # Unique filename generation
        unique_id = str(uuid.uuid4())
        ext = os.path.splitext(image.filename)[1].lower()
        original_filename = f"{unique_id}_orig{ext}"

        recipe_folder = os.path.join(current_app.root_path, 'uploads', 'recipes')
        if not os.path.exists(recipe_folder):
            os.makedirs(recipe_folder)

        filepath = os.path.join(recipe_folder, original_filename)
        image.save(filepath)

        # Image Processing (Pillow) - Generation of versions
        variation_list = []
        img = Image.open(filepath)
        if img.mode in ("RGBA", "P"): img = img.convert("RGB")

        # B&W Version
        bw_name = f"{unique_id}_bw.jpg"
        img.convert('L').save(os.path.join(recipe_folder, bw_name))
        variation_list.append(f"uploads/recipes/{bw_name}")

        # Flipped Version
        flip_name = f"{unique_id}_flip.jpg"
        img.transpose(Image.FLIP_LEFT_RIGHT).save(os.path.join(recipe_folder, flip_name))
        variation_list.append(f"uploads/recipes/{flip_name}")

        # Blurred Version
        blur_name = f"{unique_id}_blur.jpg"
        img.filter(ImageFilter.GaussianBlur(radius=5)).save(os.path.join(recipe_folder, blur_name))
        variation_list.append(f"uploads/recipes/{blur_name}")

        new_recipe = Recipe(
            title=title,
            description=description,
            instructions=instructions,
            original_image_path=f"uploads/recipes/{original_filename}",
            variation_paths=json.dumps(variation_list),
            prep_time=int(prep_time) if prep_time and str(prep_time).isdigit() else 0,
            difficulty=difficulty,
            kosher_type=kosher_type,
            user_id=int(user_id)
        )

        if ingredients_json:
            ingredients_data = json.loads(ingredients_json)
            for ing in ingredients_data:
                new_entry = IngredientEntry(
                    product_name=ing.get('product_name', ''),
                    amount=float(ing.get('amount', 0)) if ing.get('amount') else 0.0,
                    unit=ing.get('unit', '')
                )
                new_recipe.ingredients.append(new_entry)

        new_recipe.save()
        return jsonify({"success": True, "recipe_id": new_recipe.id}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": str(e)}), 500

@recipes_bp.route('/recipes/<int:recipe_id>', methods=['GET'])
def get_recipe_details(recipe_id):
    """Retrieve full data for a single recipe record."""
    recipe = Recipe.query.get_or_404(recipe_id)
    ingredients_list = [{
        'product_name': i.product_name,
        'amount': i.amount,
        'unit': i.unit
    } for i in recipe.ingredients]

    return jsonify({
        'success': True,
        'recipe': {
            'id': recipe.id,
            'title': recipe.title,
            'description': recipe.description,
            'instructions': recipe.instructions,
            'ingredients': ingredients_list,
            'prep_time': recipe.prep_time,
            'kosher_type': recipe.kosher_type,
            'difficulty': recipe.difficulty,
            'original_image_path': recipe.original_image_path,
            'variation_paths': json.loads(recipe.variation_paths) if recipe.variation_paths else []
        }
    }), 200


@recipes_bp.route('/recipes/<int:recipe_id>', methods=['DELETE'])
@jwt_required()
def delete_recipe(recipe_id):
    """Securely delete a recipe and its associated physical image files."""
    recipe = Recipe.query.get_or_404(recipe_id)
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    # Permission check: Owner or Admin only
    if recipe.user_id != int(user_id) and user.role != 'admin':
        return jsonify({"success": False, "message": "אין לך הרשאה למחוק מתכון זה"}), 403

    try:
        root = current_app.root_path

        # Cleanup: Original image
        if recipe.original_image_path:
            p = os.path.join(root, recipe.original_image_path.replace('/', os.sep))
            if os.path.exists(p):
                os.remove(p)

        # Cleanup: Variations
        if recipe.variation_paths:
            variations = json.loads(recipe.variation_paths)
            for v in variations:
                p = os.path.join(root, v.replace('/', os.sep))
                if os.path.exists(p):
                    os.remove(p)

        db.session.delete(recipe)
        db.session.commit()
        return jsonify({'success': True, 'message': 'המתכון נמחק בהצלחה'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500