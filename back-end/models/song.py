from database.connection import connect  # Đảm bảo kết nối được thiết lập
from mongoengine import Document, StringField, IntField, BooleanField, DateTimeField, ListField, EmbeddedDocument, EmbeddedDocumentField
import datetime
import random
import string

# Define an EmbeddedDocument for the singer
class Singer(EmbeddedDocument):
    singerId = StringField(required=True)
    singerName = StringField(required=True)

class Topic(EmbeddedDocument):
    topicId = StringField(required=True)
    topicName = StringField(required=True)

class Lyric(EmbeddedDocument):
    lyricContent = StringField(required=True)
    lyricStartTime = StringField(required=True)
    lyricEndTime = StringField(required=True)

class Song(Document):
    _id = StringField(required=True, max_length=100)
    title = StringField(required=True, max_length=100)
    avatar = StringField()
    audio = StringField()
    video = StringField()
    description = StringField()
    singers = ListField(EmbeddedDocumentField(Singer))
    topics = ListField(EmbeddedDocumentField(Topic))
    like = StringField()
    userLiked = ListField(StringField())
    lyrics = ListField(EmbeddedDocumentField(Lyric))
    status = StringField(default="pending")
    isPremiumOnly = BooleanField(default=False)
    createdBy = StringField()
    approvedBy = StringField()
    play_count = IntField(default=0)
    deleted = BooleanField(default=False)
    deletedAt = DateTimeField(default=None)
    slug = StringField()

    # Tự động thêm timestamps 
    createdAt = DateTimeField(default=datetime.datetime.now(datetime.timezone.utc))
    updatedAt = DateTimeField(default=datetime.datetime.now(datetime.timezone.utc))

    meta = {
        "collection": "songs",  
        "ordering": ["_id"],  
    }