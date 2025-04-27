from mongoengine import Document, StringField, DateTimeField, IntField
import datetime
import random
import string

# Hàm tạo chuỗi ngẫu nhiên 20 ký tự
def generate_random_string(length=20):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

class PricingPlan(Document):
    user_id = StringField()
    order_id = StringField(max_length=250, required=True)
    order_type = StringField(max_length=20, required=True)
    amount = IntField(required=True)
    order_desc = StringField(max_length=100, required=True)
    bank_code = StringField(max_length=20)
    language = StringField(max_length=2, required=True)
    status = StringField(max_length=20, default='active')  # Mặc định là active
    duration = IntField(required=True)  # Thời gian sử dụng gói cước (ngày)
    createdAt = DateTimeField(default=datetime.datetime.utcnow)
    updatedAt = DateTimeField(default=datetime.datetime.utcnow)

    meta = {
        "collection": "pricing_plans",  # Tên collection trong MongoDB
        "ordering": ["-createdAt"],
    }
