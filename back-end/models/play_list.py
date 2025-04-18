from database.connection import connect  # Đảm bảo kết nối được thiết lập
from mongoengine import Document, StringField, BooleanField, DateTimeField, ListField
import datetime

class PlayList(Document):
    userId = StringField(required=True)  
    title = StringField(required=True, max_length=50)  
    imageAlbum = StringField()
    songs = ListField(StringField())  
    
    deleted = BooleanField(default=False) 
    deletedAt = DateTimeField(null=True)   
    
    createdAt = DateTimeField(default=datetime.datetime.utcnow)
    updatedAt = DateTimeField(default=datetime.datetime.utcnow)

    meta = {
        "collection": "play-lists",  
        "ordering": ["-createdAt"],       
        "strict": False                  
    }
