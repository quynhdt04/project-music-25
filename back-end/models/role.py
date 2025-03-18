from database.connection import connect  # Đảm bảo kết nối được thiết lập
from mongoengine import Document, StringField, BooleanField, DateTimeField, ListField
import datetime



class Role(Document):
    title = StringField(required=True, max_length=100)
    desciption = StringField(required=True, unique=True)
    permissions = ListField(StringField())
    deleted = BooleanField(default=False)
    deletedAt = DateTimeField(default=None)

    # Tự động thêm timestamps 
    createdAt = DateTimeField(default=datetime.datetime.utcnow)
    updatedAt = DateTimeField(default=datetime.datetime.utcnow)

    meta = {
        "collection": "roles",  # Tên collection trong MongoDB
        "ordering": ["-createdAt"],  # Sắp xếp theo ngày tạo mới nhất
    }

