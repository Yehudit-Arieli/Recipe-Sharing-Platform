import os
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from models import db, User, RoleRequest

auth_bp = Blueprint('auth', __name__)


# --- Authentication Routes ---

@auth_bp.route('/register', methods=['POST'])
def register():
    """Handles new user registration and returns an access token."""
    data = request.json
    email = data.get('email')
    username = data.get('username')

    if User.query.filter_by(email=email).first():
        return jsonify({"message": "משתמש זה כבר מופיע במערכת", "success": False}), 400

    new_user = User(username=username, email=email)
    new_user.set_password(data.get('password'))

    new_user.save()

    token = create_access_token(identity=str(new_user.id))
    return jsonify({
        "message": "נרשמת בהצלחה",
        "success": True,
        "token": token,
        "user": {"id": new_user.id, "username": username, "role": "user"}
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    """Authenticates user credentials and constructs profile metadata."""
    data = request.json
    user = User.query.filter_by(email=data.get('email')).first()

    if user and user.check_password(data.get('password')):
        token = create_access_token(identity=str(user.id))

        # Dynamic construction of profile image URL
        full_image_url = user.profile_image
        if full_image_url and not full_image_url.startswith('http'):
            full_image_url = f"http://localhost:5000/uploads/profiles/{full_image_url}"

        return jsonify({
            "success": True,
            "token": token,
            "user": {
                "id": user.id,
                "username": user.username,
                "role": user.role,
                "profile_image": full_image_url
            }
        }), 200
    return jsonify({"success": False, "message": "אימייל או סיסמה שגויים"}), 401


# --- User Profile Management ---

@auth_bp.route('/update-profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Updates user profile data and handles profile image replacement."""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"success": False, "message": "משתמש לא נמצא"}), 404

    new_username = request.form.get('username')
    new_password = request.form.get('password')

    if new_username:
        user.username = new_username
    if new_password and not new_password.startswith('●'):
        user.set_password(new_password)

    # Handle Profile Image Upload & Cleanup
    if 'profile_image' in request.files:
        file = request.files['profile_image']
        if file.filename != '':

            # Delete previous image if exists
            if user.profile_image:
                try:
                    old_filename = user.profile_image.split('/')[-1]
                    old_path = os.path.join(current_app.root_path, 'uploads', 'profiles', old_filename)

                    if os.path.exists(old_path):
                        os.remove(old_path)
                except Exception as e:
                    print(f"Warning: Could not delete old image: {e}")

            ext = file.filename.rsplit('.', 1)[1].lower()
            filename = secure_filename(f"user_{user_id}.{ext}")

            base_dir = current_app.root_path
            upload_folder = os.path.join(base_dir, 'uploads', 'profiles')
            if not os.path.exists(upload_folder):
                os.makedirs(upload_folder)

            save_path = os.path.join(upload_folder, filename)
            file.save(save_path)

            user.profile_image = f"http://localhost:5000/uploads/profiles/{filename}"

    try:
        user.save()
        return jsonify({
            "success": True,
            "message": "הפרופיל עודכן בהצלחה",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role,
                "profile_image": user.profile_image
            }
        }), 200
    except Exception as e:
        db.session.rollback()  # ביטול שינויים במקרה של שגיאה
        return jsonify({"success": False, "message": str(e)}), 500


# --- Role & Permission Requests ---

@auth_bp.route('/request-permission', methods=['POST'])
@jwt_required()
def request_permission():
    """Submits or checks status of a role upgrade request."""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    existing = RoleRequest.query.filter_by(user_id=user_id).first()

    if existing:
        if existing.status == 'rejected':
            return jsonify({"message": f"{user.username}, בקשתך נדחתה על ידי המנהל", "status": "rejected"}), 200
        if existing.status == 'approved':
            return jsonify({"message": "הבקשה שלך כבר אושרה!", "status": "approved"}), 200
        return jsonify(
            {"message": f"{user.username}, כבר שלחת בקשה והיא ממתינה לאישור", "status": existing.status}), 200

    new_req = RoleRequest(user_id=user_id)
    new_req.save()
    return jsonify({"message": "בקשתך נשלחה למנהל", "status": "success"}), 201


# --- Admin Operations ---

@auth_bp.route('/admin/requests', methods=['GET'])
@jwt_required()
def get_admin_requests():
    """Admin only: Retrieve all pending and historical role requests."""
    admin_id = get_jwt_identity()
    admin_user = User.query.get(admin_id)
    if not admin_user or admin_user.role != 'admin':
        return jsonify({"message": "אין לך הרשאה"}), 403

    requests = RoleRequest.query.all()
    output = []
    for r in requests:
        output.append({
            "id": r.id,
            "username": r.user.username,
            "email": r.user.email,
            "status": r.status,
            "date": r.request_date.strftime('%d/%m/%Y')
        })
    return jsonify(output), 200


@auth_bp.route('/admin/update-request/<int:req_id>', methods=['PUT'])
@jwt_required()
def update_request(req_id):
    """Admin only: Approve or reject a specific role request."""
    data = request.json
    req = RoleRequest.query.get_or_404(req_id)
    user = User.query.get(req.user_id)

    if data.get('action') == 'approve':
        user.role = 'editor'
        req.status = 'approved'
    elif data.get('action') == 'reject':
        user.role = 'user'
        req.status = 'rejected'

    db.session.commit()
    return jsonify({"success": True})


@auth_bp.route('/admin/delete-request/<int:req_id>', methods=['DELETE'])
@jwt_required()
def delete_request(req_id):
    """Admin only: Remove a request record from the database."""
    req = RoleRequest.query.get_or_404(req_id)
    db.session.delete(req)
    db.session.commit()
    return jsonify({"success": True})
