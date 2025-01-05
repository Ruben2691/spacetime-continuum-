from .db import db, environment, SCHEMA
from datetime import datetime


class UserLink(db.Model):
    __tablename__ = "user_links"

    if environment == "production":
        __table_args__ = {"schema": SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    link_title = db.Column(db.String(255), nullable=False)
    link = db.Column(
        db.String(2048), nullable=False
    )  # Adjust size based on expected link length
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    user = db.relationship("User", back_populates="links")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "link_title": self.link_title,
            "link": self.link,
            "created_at": self.created_at.isoformat(),  # Convert datetime to string
        }
