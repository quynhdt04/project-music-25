from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from models.user import User  
from django.core.exceptions import ValidationError
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.core.paginator import Paginator
from django.db.models import Q
from models.user import User  
from bson.objectid import ObjectId 
import jwt
import re
import cloudinary
import hashlib
import hmac
import time
from django.conf import settings
from django.shortcuts import get_object_or_404


CLOUDINARY_API_SECRET = "your_api_secret"

def generate_signature(params):
    sorted_params = "&".join(f"{k}={v}" for k, v in sorted(params.items()))
    signature = hmac.new(
        CLOUDINARY_API_SECRET.encode(), 
        sorted_params.encode(), 
        hashlib.sha1
    ).hexdigest()
    return signature


import traceback  # Để log lỗi chi tiết

@csrf_exempt
def register_user(request):
    if request.method == "POST":
        try:
            full_name = request.POST.get('fullName', '').strip()
            email = request.POST.get('email', '').strip()
            password = request.POST.get('password', '').strip()
            phone = request.POST.get('phone', '').strip()
            avatar_url = None

            print("📥 Dữ liệu nhận từ client:", request.POST)
            
            # Kiểm tra nếu thiếu dữ liệu
            if not full_name or not email or not password or not phone:
                return JsonResponse({"error": "Vui lòng điền đầy đủ thông tin!"}, status=400)

            # Kiểm tra email hợp lệ
            if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
                return JsonResponse({"error": "Email không hợp lệ!"}, status=400)

            # Kiểm tra mật khẩu
            if len(password) < 6:
                return JsonResponse({"error": "Mật khẩu phải có ít nhất 6 ký tự!"}, status=400)

            # Kiểm tra số điện thoại
            if not re.match(r"^0\d{9}$", phone):
                return JsonResponse({"error": "Số điện thoại không hợp lệ!"}, status=400)

            # Kiểm tra email đã tồn tại chưa
            if User.objects(email=email).first():
                return JsonResponse({"error": "Email đã tồn tại!"}, status=400)

            # Xử lý upload ảnh
            if 'avatar' in request.FILES:
                avatar_file = request.FILES['avatar']
                upload_result = cloudinary.uploader.upload(avatar_file)
                avatar_url = upload_result.get('secure_url', None)
                print("📸 Avatar URL:", avatar_url)

            # ⚠ Thêm log trước khi lưu User
            print(f"🔍 Đang tạo user: {full_name} | {email} | {phone} | {avatar_url}")

            # Lưu User
            user = User(
                fullName=full_name,
                email=email,
                password=password,  
                phone=phone,
                avatar=avatar_url
            )
            user.save()

            return JsonResponse({
                "id": str(user.id),
                "fullName": user.fullName,
                "email": user.email,
                "phone": user.phone,
                "avatar": user.avatar,
            }, status=201)

        except Exception as e:
            print("💥 Lỗi hệ thống:", str(e))
            traceback.print_exc()
            return JsonResponse({"error": f"Lỗi hệ thống: {str(e)}"}, status=500)

    return JsonResponse({"error": "Invalid request"}, status=405)


@csrf_exempt
def login_user(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            print("Dữ liệu nhận được:", data)

            email = data.get("email")
            password = data.get("password", "")

            if not email or not password:
                return JsonResponse({"error": "Thiếu thông tin đăng nhập (email hoặc mật khẩu không được để trống)"}, status=400)

            try:
                user = User.objects.get(email=email)
                print("User found:", user)
            except User.DoesNotExist:
                return JsonResponse({"error": "Email không tồn tại"}, status=400)

            if user.deleted:
                return JsonResponse({"error": "Tài khoản không tồn tại"}, status=403)

            if password != user.password:
                return JsonResponse({"error": "Mật khẩu không đúng"}, status=400)

            if user.status == "inactive":
                return JsonResponse({"error": "Tài khoản đã bị khóa"}, status=403)
            
            print("User avatar:", user.avatar) # Kiểm tra user.avatar
            print("User object:", user) # Kiểm tra toàn bộ object user
            return JsonResponse({
                "message": "Đăng nhập thành công",
                "user": {
                    "id": str(user.id),
                    "fullName": user.fullName,
                    "email": user.email,
                    "phone": user.phone,
                    "avatar": user.avatar,
                    "status": user.status,
                    "deleted": user.deleted,
                }
            }, status=200)

        except Exception as e:
            print("Lỗi:", e)
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request"}, status=405)


@csrf_exempt
def get_user_by_id(request, _id):
    try:
        user = User.objects.get(id=_id, deleted=False)  # MongoEngine dùng "id" thay vì "_id"
        print("Avatar từ DB:", user.avatar)
        user_data = {
            "id": str(user.id),  # Chuyển ObjectId thành chuỗi
            "fullName": user.fullName,
            "email": user.email,
            "phone": user.phone,
            "avatar": user.avatar if user.avatar else "",
            "status": user.status,
            "deleted": user.deleted,
        }
        
        return JsonResponse({"user": user_data}, status=200)
    except User.DoesNotExist:
        return JsonResponse({"error": "Người dùng không tồn tại hoặc đã bị xóa!"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)



@csrf_exempt
def update_user(request, _id):
    if request.method != "PUT":
        return JsonResponse({"error": "Phương thức không hợp lệ"}, status=405)

    try:
        user = User.objects.get(id=ObjectId(_id))  
        
        # Đọc JSON từ request.body
        try:
            data = json.loads(request.body.decode("utf-8"))
            print("📩 Dữ liệu nhận được:", data)  
        except json.JSONDecodeError:
            return JsonResponse({"error": "Dữ liệu không hợp lệ"}, status=400)

        # Cập nhật thông tin
        user.fullName = data.get("name", user.fullName)
        user.email = data.get("email", user.email)  # ✅ Cập nhật email
        user.phone = data.get("phone", user.phone)

        if "password" in data and data["password"]:
            user.set_password(data["password"])

        if "avatar" in data and data["avatar"]:
            user.avatar = data["avatar"]

        user.save()
        print("✅ Dữ liệu sau cập nhật:", user.fullName, user.email, user.phone, user.avatar)

        # ✅ Trả về đầy đủ thông tin sau khi cập nhật
        return JsonResponse({
            "message": "Cập nhật thành công",
            "fullName": user.fullName,
            "email": user.email,
            "phone": user.phone,
            "avatar": str(user.avatar)
        }, status=200)

    except User.DoesNotExist:
        return JsonResponse({"error": "User không tồn tại"}, status=404)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
