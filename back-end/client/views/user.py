from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from models.user import User  # Import model User

@csrf_exempt  # Bỏ qua kiểm tra CSRF để dễ test API (nếu dùng Postman)
def register_user(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)  # Nhận JSON từ request
            user = User(
                fullName=data["fullName"],
                email=data["email"],
                password=data["password"],  # Cần hash mật khẩu
                phone=data.get("phone"),
                avatar=data.get("avatar")
            )
            user.save()  # Lưu vào MongoDB
            return JsonResponse({"message": "User created successfully!", "userId": str(user.id)}, status=201)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse({"error": "Invalid request"}, status=405)


@csrf_exempt
def get_all_users(request):
    if request.method == "GET":
        try:
            users = User.objects.all()
            user_list = [
                {
                    "id": str(user.id),
                    "fullName": user.fullName,
                    "email": user.email,
                    "phone": user.phone,
                    "avatar": user.avatar
                }
                for user in users
            ]
            return JsonResponse({"users": user_list}, status=200)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse({"error": "Invalid request"}, status=405)
