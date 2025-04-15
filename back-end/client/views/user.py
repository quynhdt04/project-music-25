from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from django.contrib.auth.hashers import make_password
from django.contrib.auth.hashers import check_password
from models.user import User  
from models.pricingPlan import PricingPlan  # Import the PricingPlan model
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
import datetime

CLOUDINARY_API_SECRET = "your_api_secret"
SECRET_KEY = settings.SECRET_KEY

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

            # Kiểm tra mật khẩu có độ mạnh phù hợp (ít nhất 6 ký tự, có chữ hoa, chữ thường, số, ký tự đặc biệt)
            password_regex = r"^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$"
            if not re.match(password_regex, password):
                return JsonResponse({
                    "error": "Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt!"
                }, status=400)

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

            # Mã hóa mật khẩu
            hashed_password = make_password(password)
             # Giá trị mặc định cho tài khoản Premium
            is_premium = False
            premium_expires_at = None

            # ⚠ Thêm log trước khi lưu User
            print(f"🔍 Đang tạo user: {full_name} | {email} | {phone} | {avatar_url}| isPremium: {is_premium} | premiumExpiresAt: {premium_expires_at}")

            # Lưu User
            user = User(
                fullName=full_name,
                email=email,
                password=hashed_password,  # Dùng mật khẩu đã hash
                phone=phone,
                avatar=avatar_url,
                isPremium=is_premium,  # Mặc định là False
                premiumExpiresAt=premium_expires_at  # Mặc định là None
            )
            user.save()

            return JsonResponse({
                "id": str(user.id),
                "fullName": user.fullName,
                "email": user.email,
                "phone": user.phone,
                "avatar": user.avatar,
                "isPremium": user.isPremium,
                "premiumExpiresAt": user.premiumExpiresAt
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
            print("Dữ liệu nhận được từ frontend:", data)

            email = data.get("email")
            password = data.get("password", "")

            if not email or not password:
                print("📌 Lỗi: Thiếu email hoặc mật khẩu")
                return JsonResponse({"error": "Thiếu thông tin đăng nhập (email hoặc mật khẩu không được để trống)"}, status=400)

            try:
                user = User.objects.get(email=email)
                print("User found:", user)
            except User.DoesNotExist:
                print(f"📌 Lỗi: Email không tồn tại, email nhận được: {email}")
                return JsonResponse({"error": "user not found"}, status=400)
            print("📌 Mật khẩu nhập vào:", password)
            print("📌 Mật khẩu trong DB:", user.password)
            
            if user.deleted:
                return JsonResponse({"error": "Tài khoản không tồn tại"}, status=403)

            if not check_password(password, user.password):
                print("📌 Lỗi: Mật khẩu không đúng")
                return JsonResponse({"error": "incorrect password"}, status=400)

            if user.status == "inactive":
                return JsonResponse({"error": "Tài khoản đã bị khóa"}, status=403)
              # Lưu user_id vào session
            request.session['user_id'] = str(user.id)
            print(f"📌 Đã lưu user_id vào session: {user.id}")

            # Cập nhật trạng thái Premium nếu có
            check_and_update_user_premium(request)
            #  🔹 Tạo JWT Token
            payload = {
                "id": str(user.id),
                "email": user.email,
                "exp": datetime.datetime.utcnow() + datetime.timedelta(days=1),  # Token hết hạn sau 1 ngày
                "iat": datetime.datetime.utcnow(),  # Thời gian tạo
            }
            token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")

            
            print("User avatar:", user.avatar) # Kiểm tra user.avatar
            print("User object:", user) # Kiểm tra toàn bộ object user
            return JsonResponse({
                "message": "Đăng nhập thành công",
                "token": token,
                "user": {
                    "id": str(user.id),
                    "fullName": user.fullName,
                    "email": user.email,
                    "phone": user.phone,
                    "avatar": user.avatar,
                    "status": user.status,
                    "deleted": user.deleted,
                    "isPremium": user.isPremium,  # Thêm thông tin Premium
                    "premiumExpiresAt": user.premiumExpiresAt.strftime("%Y-%m-%d") if user.premiumExpiresAt else None,
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
            "isPremium": user.isPremium,  # Thêm thông tin Premium
            "premiumExpiresAt": user.premiumExpiresAt.strftime("%Y-%m-%d") if user.premiumExpiresAt else None,
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
        user.fullName = data.get("fullName", user.fullName)
        user.email = data.get("email", user.email)  # ✅ Cập nhật email
        user.phone = data.get("phone", user.phone)

        if "password" in data and data["password"]:
            user.password = make_password(data["password"])

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
    
@csrf_exempt
def update_avatar(request, _id):
    if request.method == "POST":
        if 'avatar' in request.FILES:
            avatar_file = request.FILES['avatar']
            upload_result = cloudinary.uploader.upload(avatar_file)
            avatar_url = upload_result['secure_url']
            print("📦 FILES:", request.FILES)
            user = User.objects.get(id=ObjectId(_id))
            user.avatar = avatar_url
            user.save()

            return JsonResponse({
                "message": "Cập nhật avatar thành công",
                "avatar": avatar_url,
                "fullName": user.fullName,
                "email": user.email,
                "phone": user.phone,
            })
        else:
            return JsonResponse({"error": "Avatar file is missing in the request."}, status=400)
    else:
        return JsonResponse({"error": "Invalid request method."}, status=400)
@csrf_exempt
def check_and_update_user_premium(request):
    user_id = request.session.get('user_id')  # Lấy user_id từ session
    if user_id:
        # Kiểm tra nếu có một PricingPlan nào đó có user_id trùng với user_id này
        pricing_plan = PricingPlan.objects.filter(user_id=user_id).first()

        if pricing_plan:
            user = User.objects.get(id=user_id)  # Lấy người dùng từ cơ sở dữ liệu
            user.isPremium = True  # Cập nhật isPremium thành True
            user.save()  # Lưu thay đổi
            print(f"User {user_id} đã được cập nhật là Premium")
        else:
            print(f"User {user_id} không có thông tin Premium")
    else:
        print("Không tìm thấy user_id trong session")
