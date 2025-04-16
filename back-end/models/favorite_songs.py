from database.connection import connect  # Đảm bảo kết nối được thiết lập
from mongoengine import Document, StringField, BooleanField, DateTimeField, ListField, ObjectIdField
import datetime

class FavoriteSong(Document):
    userId = StringField(required=True)
    songId = ListField(StringField())
    deleted = BooleanField(default=False)
    deletedAt = DateTimeField(default=None)

    # Tự động thêm timestamps 
    createdAt = DateTimeField(default=datetime.datetime.now(datetime.timezone.utc))
    updatedAt = DateTimeField(default=datetime.datetime.now(datetime.timezone.utc))

    meta = {
        "collection": "favorite-songs",  
        "ordering": ["_id"],  
    }