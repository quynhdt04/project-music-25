from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from asgiref.sync import sync_to_async
from models.role import Role

@csrf_exempt
async def get_all_roles(request):
    if request.method == "GET":
        try:
            roles = await sync_to_async(lambda: list(Role.objects.filter(deleted=False)))()
            roles_list = [
                {
                    "id": str(role.id),
                    "title": role.title,
                    "desciption": role.desciption,
                    "permissions": role.permissions,
                    "deleted": role.deleted
                }
                for role in roles
            ]
            return JsonResponse({"roles": roles_list}, status=200)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse({"error": "Invalid request"}, status=405)


@csrf_exempt
async def create_role(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)

            # Kiểm tra title không được để trống
            title = data.get("title", "")
            if not title:
                return JsonResponse({"error": "Tên nhóm quyền không được để trống!"}, status=400)

            # Kiểm tra title không được trùng
            existing_role = await sync_to_async(lambda: Role.objects.filter(title=title).first())()
            if existing_role:
                return JsonResponse({"error": "Tên nhóm quyền đã tồn tại!"}, status=400)

            # Tạo role mới
            new_role = Role(
                title=title,
                desciption=data.get("desciption", ""),
                permissions=data.get("permissions", []),
            )
            await sync_to_async(new_role.save)()

            return JsonResponse({"message": "Tạo nhóm quyền thành công!", "id": str(new_role.id)}, status=201)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Dữ liệu không hợp lệ!"}, status=400)
        except Exception as e:
            return JsonResponse({"error": f"Lỗi hệ thống: {str(e)}"}, status=500)

    return JsonResponse({"error": "Phương thức yêu cầu không hợp lệ!"}, status=405)


@csrf_exempt
async def patch_role(request, role_id):
    if request.method == "PATCH":
        try:
            data = json.loads(request.body)

            # Kiểm tra role có tồn tại không
            role = await sync_to_async(lambda: Role.objects.filter(id=role_id, deleted=False).first())()
            if not role:
                return JsonResponse({"error": "Vai trò không tồn tại!"}, status=404)

            # Kiểm tra title không được để trống
            if "title" in data:
                new_title = data["title"]
                if not new_title:
                    return JsonResponse({"error": "Tên vai trò không được để trống!"}, status=400)

                # Kiểm tra title không được trùng (trừ chính nó)
                existing_role = await sync_to_async(lambda: Role.objects.filter(title=new_title, id__ne=role_id).first())()
                if existing_role:
                    return JsonResponse({"error": "Tên vai trò đã tồn tại!"}, status=400)
                
                role.title = new_title

            # Cập nhật các trường khác nếu có
            if "desciption" in data:
                role.desciption = data["desciption"]
            if "permissions" in data:
                role.permissions = data["permissions"]
            if "deleted" in data:
                role.deleted = data["deleted"]

            await sync_to_async(role.save)()
            return JsonResponse({"message": "Cập nhật vai trò thành công!", "id": role_id}, status=200)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Dữ liệu không hợp lệ!"}, status=400)
        except Exception as e:
            return JsonResponse({"error": f"Lỗi hệ thống: {str(e)}"}, status=500)

    return JsonResponse({"error": "Phương thức yêu cầu không hợp lệ!"}, status=405)


@csrf_exempt
async def get_role_by_id(request, role_id):
    if request.method == "GET":
        try:
            role = await sync_to_async(lambda: Role.objects.filter(id=role_id, deleted=False).first())()
            if not role:
                return JsonResponse({"error": "Tài khoản này thuộc nhóm quyền không tồn tại hoặc đã bị xóa!"}, status=404)

            role_data = {
                "id": str(role.id),
                "title": role.title,
                "desciption": role.desciption,
                "permissions": role.permissions,
                "deleted": role.deleted
            }
            return JsonResponse({"role": role_data}, status=200)

        except Exception as e:
            return JsonResponse({"error": "Đã xảy ra lỗi trong quá trình xử lý dữ liệu!"}, status=400)

    return JsonResponse({"error": "Phương thức không hợp lệ! Vui lòng sử dụng phương thức GET."}, status=405)
