from database.connection import connect  # Đảm bảo kết nối được thiết lập
from mongoengine import Document, StringField, IntField, BooleanField, DateTimeField, ListField, EmbeddedDocument, EmbeddedDocumentField
import datetime

class Album(Document):
    _id = StringField(required=True, max_length=100)
    title = StringField(required=True, max_length=100)
    avatar = StringField()
    singerId = StringField()
    songs = ListField(StringField())
    status = StringField(default="pending")
    createdBy = StringField()
    approvedBy = StringField()
    deleted = BooleanField(default=False)
    deletedAt = DateTimeField(default=None)

    # Tự động thêm timestamps 
    createdAt = DateTimeField(default=datetime.datetime.now(datetime.timezone.utc))
    updatedAt = DateTimeField(default=datetime.datetime.now(datetime.timezone.utc))

    meta = {
        "collection": "albums",  
        "ordering": ["_id"],  
    }