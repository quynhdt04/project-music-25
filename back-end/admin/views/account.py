from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.hashers import check_password, make_password
import json
from models.account import Account
from django.core.exceptions import ValidationError
from django.core.paginator import Paginator
from django.db.models import Q
from asgiref.sync import sync_to_async

@csrf_exempt
async def get_all_accounts(request):
    if request.method == "GET":
        try:
            page = int(request.GET.get("page", 1))  # Trang mặc định là 1
            limit = int(request.GET.get("limit", 3))  # Số lượng item trên mỗi trang mặc định là 3

            accounts = await sync_to_async(list)(Account.objects.filter(deleted=False).order_by("id"))
            paginator = Paginator(accounts, limit)  # Áp dụng phân trang

            if page > paginator.num_pages or page < 1:
                return JsonResponse({"error": "Page out of range"}, status=400)

            accounts_page = paginator.page(page)
            accounts_list = [
                {
                    "id": str(account.id),
                    "fullName": account.fullName,
                    "email": account.email,
                    "phone": account.phone,
                    "avatar": account.avatar,
                    "status": account.status,
                    "role_id": account.role_id,
                    "deleted": account.deleted
                }
                for account in accounts_page
            ]

            return JsonResponse({
                "accounts": accounts_list,
                "pagination": {
                    "currentPage": page,
                    "limit": limit,
                    "totalPages": paginator.num_pages,
                    "totalItems": paginator.count
                }
            }, status=200)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    
    return JsonResponse({"error": "Invalid request"}, status=405)


@csrf_exempt
async def create_account(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)

            # Lấy dữ liệu từ request, loại bỏ khoảng trắng thừa
            full_name = data.get("fullName", "").strip()
            email = data.get("email", "").strip()
            password = data.get("password", "").strip()
            role_id = data.get("role_id", "").strip()
            phone = data.get("phone", "").strip()
            avatar = data.get("avatar", "") or "https://res.cloudinary.com/dtycrb54t/image/upload/v1742195186/jp0gvzzqtkewbh8ybtml.jpg"
            status = data.get("status", "active")

            # Kiểm tra các trường bắt buộc
            if not full_name:
                return JsonResponse({"error": "Họ tên không được để trống!"}, status=400)
            if not email:
                return JsonResponse({"error": "Email không được để trống!"}, status=400)
            if not password:
                return JsonResponse({"error": "Mật khẩu không được để trống!"}, status=400)
            if not role_id:
                return JsonResponse({"error": "Vai trò không được để trống!"}, status=400)

            # Kiểm tra định dạng email (cơ bản)
            if "@" not in email or "." not in email:
                return JsonResponse({"error": "Email không hợp lệ!"}, status=400)

            # Kiểm tra độ dài mật khẩu
            if len(password) < 6:
                return JsonResponse({"error": "Mật khẩu phải có ít nhất 6 ký tự!"}, status=400)

            # Kiểm tra email đã tồn tại chưa
            existing_account = await sync_to_async(Account.objects.filter(email=email).first)()
            if existing_account:
                return JsonResponse({"error": "Email đã tồn tại!"}, status=400)

            # Mã hóa mật khẩu
            hashed_password = await sync_to_async(make_password)(password)

            # Tạo tài khoản mới
            account = Account(
                fullName=full_name,
                email=email,
                phone=phone,
                avatar=avatar,
                status=status,
                role_id=role_id,  # Lưu role dưới dạng string
                password=hashed_password,   
            )
            await sync_to_async(account.save)()

            return JsonResponse({"message": "Tạo tài khoản thành công!", "account_id": str(account.id)}, status=201)

        except Exception as e:
            return JsonResponse({"error": f"Lỗi hệ thống: {str(e)}"}, status=500)

    return JsonResponse({"error": "Invalid request"}, status=405)


@csrf_exempt
async def login(request):
    if request.method == "GET":  # Chấp nhận GET request
        try:
            email = request.GET.get("email")
            password = request.GET.get("password", "")

            # (1) Thiếu thông tin đăng nhập
            if not email or not password:
                return JsonResponse({"error": "Thiếu thông tin đăng nhập (email hoặc mật khẩu không được để trống)"}, status=400)

            # Kiểm tra email có tồn tại không
            account = await sync_to_async(Account.objects.filter(email=email).first)()
            if not account:
                return JsonResponse({"error": "Email không tồn tại"}, status=400)

            # (3) Kiểm tra tài khoản có bị khóa không
            if account.deleted:
                return JsonResponse({"error": "Tài khoản không tồn tại"}, status=403)

            # (4) Kiểm tra mật khẩu có đúng không
            is_valid_password = await sync_to_async(check_password)(password, account.password)
            if not is_valid_password:
                return JsonResponse({"error": "Mật khẩu không đúng"}, status=400)
            
            if account.status == "inactive":
                return JsonResponse({"error": "Tài khoản đã bị khóa"}, status=403)

            # (5) Đăng nhập thành công
            return JsonResponse({
                "message": "Đăng nhập thành công",
                "account": {
                    "id": str(account.id),
                    "fullName": account.fullName,
                    "email": account.email,
                    "token": account.token,
                    "phone": account.phone,
                    "avatar": account.avatar,
                    "status": account.status,
                    "role_id": account.role_id,
                    "deleted": account.deleted
                }
            }, status=200)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request"}, status=405)


@csrf_exempt
async def patch_account(request, account_id):
    if request.method == "PATCH":
        try:
            data = json.loads(request.body)

            # Kiểm tra tài khoản có tồn tại không
            account = await sync_to_async(Account.objects.filter(id=account_id).first)()
            if not account:
                return JsonResponse({"error": "Tài khoản không tồn tại!"}, status=404)

            # Kiểm tra fullName không được để trống
            if "fullName" in data:
                new_fullName = data["fullName"]
                if not new_fullName:
                    return JsonResponse({"error": "Không được để trống họ & tên"}, status=400)
                account.fullName = new_fullName

            # Mã hóa mật khẩu nếu có và không rỗng
            if "password" in data:
                new_password = data["password"]
                if new_password:  # Chỉ cập nhật nếu mật khẩu không rỗng
                    account.password = await sync_to_async(make_password)(new_password)

            # Kiểm tra số điện thoại hợp lệ
            if "phone" in data:
                phone = data["phone"]
                if not phone.isdigit() or len(phone) != 10:
                    return JsonResponse({"error": "Số điện thoại không hợp lệ!"}, status=400)
                account.phone = phone

            # Cập nhật các trường khác nếu có
            for field in ["avatar", "status"]:
                if field in data:
                    setattr(account, field, data[field])

            # Cập nhật trạng thái deleted nếu có trong request
            if "deleted" in data:
                deleted_value = data["deleted"]
                if isinstance(deleted_value, bool):  # Kiểm tra deleted là True/False
                    account.deleted = deleted_value
                else:
                    return JsonResponse({"error": "Giá trị deleted không hợp lệ!"}, status=400)

            await sync_to_async(account.save)()
            return JsonResponse({"message": "Cập nhật thông tin tài khoản thành công!", "id": account_id}, status=200)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Dữ liệu không hợp lệ!"}, status=400)
        except Exception as e:
            return JsonResponse({"error": f"Lỗi hệ thống: {str(e)}"}, status=500)

    return JsonResponse({"error": "Phương thức yêu cầu không hợp lệ!"}, status=405)



@csrf_exempt
async def get_account_by_id(request, account_id):
    if request.method == "GET":
        try:
            # Lấy tài khoản với điều kiện deleted=False
            # account = await sync_to_async(Account.objects.filter(id=account_id, deleted=False).afirst)()
            account = await sync_to_async(lambda: Account.objects.filter(id=account_id, deleted=False).first())()

            if not account:
                return JsonResponse({"error": "Tài khoản không tồn tại hoặc đã bị xóa!"}, status=404)
            
            # Trả về thông tin tài khoản
            account_data = {
                "id": str(account.id),
                "fullName": account.fullName,
                "email": account.email,
                "phone": account.phone,
                "avatar": account.avatar,
                "status": account.status,
                "role_id": account.role_id,
                "deleted": account.deleted
            }
            return JsonResponse({"account": account_data}, status=200)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request"}, status=405)
