from mongoengine import (
    Document, StringField, ReferenceField, BooleanField,
    DateTimeField, CASCADE
)
import datetime
import uuid
from models.user import User
from models.conversation import Conversation


class Message(Document):
    id = StringField(primary_key=True, default=lambda: str(uuid.uuid4()))
    conversation_id = StringField(required=True)
    sender_id = StringField(required=True)
    sender_name = StringField(required=True, max_length=100)
    sender_avatar = StringField()
    content = StringField()  # Tin nhắn văn bản
    type = StringField()  # Loại TEXT/IMAGE/ICON

    deleted = BooleanField(default=False)
    deletedAt = DateTimeField(default=None)
    createdAt = DateTimeField(default=datetime.datetime.utcnow)

    def save(self, *args, **kwargs):

        if self.deleted and not self.deletedAt:
            self.deletedAt = datetime.datetime.utcnow()

        return super(Message, self).save(*args, **kwargs)

    meta = {
        "collection": "messages",
        "ordering": ["createdAt"],  # Sắp xếp theo thời gian gửi
    }
