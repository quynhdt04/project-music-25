from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.hashers import check_password
import json
from models.user import User  # Thay đổi import thành model User
from django.core.exceptions import ValidationError
from django.core.paginator import Paginator
from django.db.models import Q
from models.user import User  # Thay đổi import thành model User


@csrf_exempt
def register_user(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)

            # Lấy dữ liệu từ request
            full_name = data.get("fullName", "")
            email = data.get("email", "")
            password = data.get("password", "")
            phone = data.get("phone", "")
            avatar = data.get("avatar", "") or "https://res.cloudinary.com/dtycrb54t/image/upload/v1742195186/jp0gvzzqtkewbh8ybtml.jpg"
            status = data.get("status", "active")

            # Kiểm tra các trường bắt buộc
            if not full_name or not email or not password:
                return JsonResponse({"error": "Họ tên, email và mật khẩu không được để trống!"}, status=400)

            # Kiểm tra định dạng email và độ dài mật khẩu
            if "@" not in email or "." not in email:
                return JsonResponse({"error": "Email không hợp lệ!"}, status=400)
            if len(password) < 6:
                return JsonResponse({"error": "Mật khẩu phải có ít nhất 6 ký tự!"}, status=400)

            # Kiểm tra email đã tồn tại chưa
            if User.objects(email=email).first():
                return JsonResponse({"error": "Email đã tồn tại!"}, status=400)

            # Mã hóa mật khẩu
            # hashed_password = make_password(password)

            # Tạo người dùng mới
            user = User(
                fullName=full_name,
                email=email,
                phone=phone,
                avatar=avatar,
                status=status,
                password=password,
            )
            user.save()

            return JsonResponse({"message": "Tạo người dùng thành công!", "user_id": str(user.id)}, status=201)

        except ValidationError as e:
            return JsonResponse({"error": str(e)}, status=400)
        except Exception as e:
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
def update_user_profile(request, user_id):
    if request.method == "PATCH":
        try:
            data = json.loads(request.body)

            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return JsonResponse({"error": "Người dùng không tồn tại!"}, status=404)

            if "fullName" in data:
                new_fullName = data["fullName"]
                if not new_fullName:
                    return JsonResponse({"error": "Không được để trống họ & tên"}, status=400)
                user.fullName = new_fullName

            if "password" in data:
                new_password = data["password"]
                # if new_password:
                #     user.password = make_password(new_password)

            if "phone" in data:
                phone = data["phone"]
                if not phone.isdigit() or len(phone) != 10:
                    return JsonResponse({"error": "Số điện thoại không hợp lệ!"}, status=400)
                user.phone = phone

            for field in ["avatar", "status", "deleted"]:
                if field in data:
                    setattr(user, field, data[field])

            user.save()
            return JsonResponse({"message": "Cập nhật thông tin người dùng thành công!", "id": user_id}, status=200)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Dữ liệu không hợp lệ!"}, status=400)
        except Exception as e:
            return JsonResponse({"error": f"Lỗi hệ thống: {str(e)}"}, status=500)

    return JsonResponse({"error": "Phương thức yêu cầu không hợp lệ!"}, status=405)

@csrf_exempt
def get_user_by_id(request, user_id):
    if request.method == "GET":
        try:
            user = User.objects.get(id=user_id, deleted=False)

            user_data = {
                "id": str(user.id),
                "fullName": user.fullName,
                "email": user.email,
                "phone": user.phone,
                "avatar": user.avatar,
                "status": user.status,
                "deleted": user.deleted,
            }
            return JsonResponse({"user": user_data}, status=200)

        except User.DoesNotExist:
            return JsonResponse({"error": "Người dùng không tồn tại hoặc đã bị xóa!"}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request"}, status=405)