# links_routes.py
from flask import Blueprint, request, jsonify
from app.models import UserLink, db
from flask_login import current_user, login_required

links_routes = Blueprint("links_routes", __name__)


@links_routes.route("/save-favorite", methods=["POST"])
@login_required
def save_favorite():
    link_data = request.get_json()
    link = link_data.get("link")
    user_id = current_user.id

    if not link:
        return "Link is required", 400

    # Create a new UserLink record
    new_link = UserLink(user_id=user_id, link=link)
    db.session.add(new_link)
    db.session.commit()

    return "Link saved", 200
