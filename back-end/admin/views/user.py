from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from models.user import User
import logging
from django.core.exceptions import ValidationError, ObjectDoesNotExist
import json
from django.contrib.auth.hashers import make_password

logger = logging.getLogger(__name__)

@csrf_exempt
def get_all_users(request):
    if request.method == "GET":
        try:
            users = list(User.objects.filter(deleted=False))
            users_list = [
                {
                    "id": str(u.id),
                    "fullName": u.fullName,
                    "email": u.email,
                    "phone": u.phone,
                    "avatar": u.avatar,
                    "status": u.status,
                    "deleted": u.deleted,
                    "deletedAt": u.deletedAt,
                    "createdAt": u.createdAt.strftime('%d/%m/%Y %H:%M:%S') if u.createdAt else None,
                    "updatedAt": u.updatedAt.strftime('%d/%m/%Y %H:%M:%S') if u.updatedAt else None
                }
                for u in users
            ]
            return JsonResponse({"users": users_list}, status=200)
        except Exception as e:
            logger.error(f"Lỗi khi lấy danh sách người dùng: {e}")
            return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse({"error": "Invalid request"}, status=405)

@csrf_exempt
def get_user_by_id(request, user_id):
    if request.method == "GET":
        try:
            user = User.objects.get(id=user_id)
            user_data = {
                "id": str(user.id),
                "fullName": user.fullName,
                "email": user.email,
                "phone": user.phone,
                "avatar": user.avatar,
                "status": user.status,
                "deleted": user.deleted,
                "deletedAt": user.deletedAt,
                "createdAt": user.createdAt.strftime('%d/%m/%Y %H:%M:%S') if user.createdAt else None,
                "updatedAt": user.updatedAt.strftime('%d/%m/%Y %H:%M:%S') if user.updatedAt else None
            }
            return JsonResponse({"user": user_data}, status=200)
        except ObjectDoesNotExist:
            return JsonResponse({"error": "Người dùng không tồn tại."}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse({"error": "Invalid request"}, status=405)

@csrf_exempt
def patch_user(request, user_id):
    if request.method == "PATCH":
        try:
            body = json.loads(request.body)
            user = User.objects.get(id=user_id)
            
            # Cập nhật các trường nếu có trong body
            if 'fullName' in body:
                user.fullName = body['fullName']
            if 'email' in body:
                user.email = body['email']
            if 'phone' in body:
                user.phone = body['phone']
            if 'avatar' in body:
                user.avatar = body['avatar']
            if 'status' in body:
                user.status = body['status']

            user.save()
            
            return JsonResponse({"message": "Cập nhật người dùng thành công."}, status=200)
        except ObjectDoesNotExist:
            return JsonResponse({"error": "Người dùng không tồn tại."}, status=404)
        except ValidationError as e:
            return JsonResponse({"error": str(e)}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse({"error": "Invalid request"}, status=405)

@csrf_exempt
def create_user(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)

            # Lấy dữ liệu từ request
            full_name = data.get("fullName", "").strip()
            email = data.get("email", "").strip()
            password = data.get("password", "").strip()
            phone = data.get("phone", "").strip()
            avatar = data.get("avatar", "") or data.get("https://res.cloudinary.com/dtycrb54t/image/upload/v1742195186/jp0gvzzq")
            status = data.get("status", "active")

            # Kiểm tra các trường bắt buộc
            if not full_name:
                return JsonResponse({"error": "Tên người dùng không được để trống!"}, status=400)
            if not email:
                return JsonResponse({"error": "Email không được để trống!"}, status=400)
            if not password:
                return JsonResponse({"error": "Mật khẩu không được để trống!"}, status=400)
            if len(password) < 6:
                return JsonResponse({"error": "Mật khẩu phải có ít nhất 6 ký tự!"}, status=400)

            # Kiểm tra email đã tồn tại chưa
            if User.objects.filter(email=email).first():
                return JsonResponse({"error": "Email đã được sử dụng!"}, status=400)

            # Tạo người dùng mới
            user = User(
                fullName=full_name,
                email=email,
                password=make_password(password),
                phone=phone,
                avatar=avatar,
                status=status,
            )
            user.save()

            return JsonResponse({"message": "Tạo người dùng thành công!", "user_id": str(user.id)}, status=201)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Dữ liệu gửi lên không phải JSON hợp lệ!"}, status=400)
        except ValidationError as e:
            return JsonResponse({"error": str(e)}, status=400)
        except Exception as e:
            return JsonResponse({"error": f"Lỗi hệ thống: {str(e)}"}, status=500)

    return JsonResponse({"error": "Invalid request"}, status=405)

@csrf_exempt
def delete_user(request, user_id):
    if request.method == "DELETE":
        try:
            user = User.objects.filter(id=user_id).first()

            if not user:
                return JsonResponse({"error": "Người dùng không tồn tại."}, status=404)
            
            user.deleted = True
            user.status = "inactive"
            user.save()
            
            return JsonResponse({"message": "Xoá người dùng thành công!", "user_id": str(user.id)}, status=201)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Dữ liệu gửi lên không phải JSON hợp lệ!"}, status=400)
        except ValidationError as e:
            return JsonResponse({"error": str(e)}, status=400)
        except Exception as e:
            return JsonResponse({"error": f"Lỗi hệ thống: {str(e)}"}, status=500)

    return JsonResponse({"error": "Invalid request"}, status=405)