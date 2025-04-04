from database.connection import connect
from mongoengine import Document, StringField, BooleanField, DateTimeField
import datetime
import re
from unidecode import unidecode

class Singer(Document):
    fullName = StringField(required=True, max_length=100)
    avatar = StringField()
    status = StringField(default="active", choices=["active", "inactive"])
    slug = StringField(unique=True)  
    deleted = BooleanField(default=False)
    deletedAt = DateTimeField(default=None)
    createdAt = DateTimeField(default=datetime.datetime.utcnow)
    updatedAt = DateTimeField(default=datetime.datetime.utcnow)


    def generate_slug(self):
        base_slug = unidecode(self.fullName).lower().strip()
        base_slug = re.sub(r'[^a-z0-9]+', '-', base_slug).strip('-')
        
        # Kiểm tra trùng slug
        slug = base_slug
        counter = 1
        while Singer.objects(slug=slug).first():
            slug = f"{base_slug}-{counter}"
            counter += 1
        return slug

    def save(self, *args, **kwargs):
        # Tạo slug nếu chưa có
        if not self.slug:
            self.slug = self.generate_slug()
        
        # Cập nhật updatedAt mỗi khi lưu
        self.updatedAt = datetime.datetime.utcnow()

        # Cập nhật deletedAt nếu deleted = True
        if self.deleted and not self.deletedAt:
            self.deletedAt = datetime.datetime.utcnow()
        
        super(Singer, self).save(*args, **kwargs)

    def __str__(self):
        return f"{self.fullName} ({self.slug})"

    meta = {
        "collection": "singers",
        "ordering": ["-createdAt"],
    }
