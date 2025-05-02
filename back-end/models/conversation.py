from mongoengine import (
    Document, StringField, BooleanField, DateTimeField, ListField, ReferenceField
)
import datetime
import uuid

class Conversation(Document):
    # id = StringField(primary_key=True, required=True, max_length=36, default=lambda: str(uuid.uuid4()))
    name = StringField(max_length=100, required=True)
    img = StringField()
    status = StringField(default="active", choices=["active", "inactive"])
    deleted = BooleanField(default=False)
    deletedAt = DateTimeField(default=None)
    createdAt = DateTimeField(default=datetime.datetime.utcnow)
    updatedAt = DateTimeField(default=datetime.datetime.utcnow)

    def save(self, *args, **kwargs):
        self.updatedAt = datetime.datetime.utcnow()
        if self.deleted and not self.deletedAt:
            self.deletedAt = datetime.datetime.utcnow()
        super(Conversation, self).save(*args, **kwargs)

    def __str__(self):
        return self.name or self.id

    meta = {
        "collection": "conversations",
        "ordering": ["-createdAt"]
    }
