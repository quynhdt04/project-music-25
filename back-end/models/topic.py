from database.connection import connect  # Đảm bảo kết nối được thiết lập
from mongoengine import Document, StringField, BooleanField, DateTimeField
import datetime

# Topic(name, description, status, deleted, deletedAt)

class Topic(Document):
    title = StringField(required=True, unique=True, max_length=100)
    slug = StringField(required=True, unique=True, max_length=100)
    avatar = StringField()
    description = StringField(max_length=500)
    status = StringField(default="active")
    deleted = BooleanField(default=False)
    deletedAt = DateTimeField(default=None)
    createdAt = DateTimeField(default=datetime.datetime.utcnow)
    updatedAt = DateTimeField(default=datetime.datetime.utcnow)

    meta = {
        "collection": "topics",
        "ordering": ["-createdAt"],
    }

    def save(self, *args, **kwargs):
        self.updatedAt = datetime.datetime.utcnow()
        return super(Topic, self).save(*args, **kwargs)

    def to_dict(self):
        return {
            "id": str(self.id),
            "title": self.title,
            "slug": self.slug,
            "avatar": self.avatar,
            "description": self.description,
            "status": self.status,
            "deleted": self.deleted,
            "deletedAt": self.deletedAt.isoformat() if self.deletedAt else None,
            "createdAt": self.createdAt.isoformat(),
            "updatedAt": self.updatedAt.isoformat()
        }
