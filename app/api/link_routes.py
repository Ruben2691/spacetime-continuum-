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
    title = link_data.get("title")
    user_id = current_user.id

    if not link:
        return "Link is required", 400

    # Create a new UserLink record
    new_link = UserLink(user_id=user_id, link=link, link_title=title)
    db.session.add(new_link)
    db.session.commit()

    return "Link saved", 200


@links_routes.route("/get-favorites", methods=["GET"])
@login_required
def get_favorites():
    try:
        user_id = current_user.id
        user_links = UserLink.query.filter_by(user_id=user_id).all()
        links = [link.to_dict() for link in user_links]
        return jsonify(links), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@links_routes.route("/delete-favorite", methods=["DELETE"])
@login_required
def delete_favorite():
    link_id = request.get_json().get(
        "link_id"
    )  # Ensure the key matches the frontend key
    user_id = current_user.id
    db_resource = UserLink.query.filter_by(id=link_id, user_id=user_id).first()

    if db_resource:
        db.session.delete(db_resource)
        db.session.commit()
        return jsonify({"message": "Link deleted"}), 200  # Return a success message
    else:
        return jsonify(
            {"error": "Link not found"}
        ), 404  # Handle the case where the link doesn't exist
