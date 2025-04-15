from database.connection import connect  # Đảm bảo kết nối được thiết lập
from mongoengine import Document, StringField, BooleanField, DateTimeField
import datetime
import random
import string
from django.db import models
from datetime import timedelta


# Hàm tạo chuỗi ngẫu nhiên 20 ký tự (giống generate.generateRandomString(20))
def generate_random_string(length=20):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

class User(Document):
    fullName = StringField(required=True, max_length=100)
    email = StringField(required=True, unique=True)
    password = StringField(required=True, min_length=6)
    tokenUser = StringField(default=generate_random_string)  # Tự động tạo token
    phone = StringField(max_length=15)
    avatar = StringField()
    status = StringField(default="active") 
    deleted = BooleanField(default=False)
    deletedAt = DateTimeField(default=None)
    isPremium = BooleanField(default=False)  # Mặc định là False
    premiumExpiresAt = DateTimeField(default=None)

    # Tự động thêm timestamps 
    createdAt = DateTimeField(default=datetime.datetime.utcnow)
    updatedAt = DateTimeField(default=datetime.datetime.utcnow)
    
    def save(self, *args, **kwargs):
        
        # Cập nhật updatedAt mỗi khi lưu
        self.updatedAt = datetime.datetime.utcnow()

        # Cập nhật deletedAt nếu deleted = True
        if self.deleted and not self.deletedAt:
            self.deletedAt = datetime.datetime.utcnow()
        
        super(User, self).save(*args, **kwargs)


    meta = {
        "collection": "users",  # Tên collection trong MongoDB
        "ordering": ["-createdAt"],  # Sắp xếp theo ngày tạo mới nhất
    }

  