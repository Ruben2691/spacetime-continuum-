from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from app.models import User, db


user_routes = Blueprint('users', __name__)


@user_routes.route('/')
@login_required
def users():
    """
    Query for all users and returns them in a list of user dictionaries
    """
    users = User.query.all()
    return {'users': [user.to_dict() for user in users]}


@user_routes.route('/<int:id>')
@login_required
def user(id):
    """
    Query for a user by id and returns that user in a dictionary
    """
    user = User.query.get(id)
    return user.to_dict()


@user_routes.route('/profile/<int:id>', methods=['PUT'])
@login_required
def profile_updater(id):
    user = User.query.get_or_404(id)
    data = request.get_json()
    if user:
        user.username = data.get('username', user.username)
        user.email = data.get('email', user.email)
        password = data.get('password')
        if password:
            user.password = data.get('password', user.password)
        db.session.commit()
        return jsonify(user.to_dict())
    else:
        return 'user error'

@user_routes.route('/profile/<int:id>', methods=['DELETE'])
# @login_required
def profile_deleter(id):
    user = User.query.get_or_404(id)
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "user successfully deleted"}), 200

@user_routes.route("/profiles", methods=['GET'])
def get_users_profiles():
    users = User.query.all()
    all_users = [user.to_dict() for user in users]
    if users:
        return jsonify(all_users)
    else:
        return 'user error'


@user_routes.route("/profiles/<int:id>", methods=['GET'])
def get_single_user_profile(id):
    users = User.query.get_or_404(id)
    user = users.to_dict()
    if users:
        return jsonify(user)
    else:
        return 'user error'
