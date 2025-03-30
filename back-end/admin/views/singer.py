from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from models.singer import Singer
from django.core.exceptions import ValidationError, ObjectDoesNotExist
from django.utils import timezone

import logging
logger = logging.getLogger(__name__)


@csrf_exempt
def get_all_singers(request):
    if request.method == "GET":
        try:
            singers =list(Singer.objects.filter(deleted=False))
            singers_list = [
                {
                    "id": str(s.id),
                    "fullName": s.fullName,
                    "avatar": s.avatar,
                    "status": s.status,
                    "slug": s.slug,
                    "deleted": s.deleted,
                    "deletedAt": s.deletedAt,
                    "createdAt": s.createdAt.strftime('%d/%m/%Y %H:%M:%S') if s.createdAt else None,
                    "updatedAt": s.updatedAt.strftime('%d/%m/%Y %H:%M:%S') if s.updatedAt else None
                }
                for s in singers
            ]
            return JsonResponse({"singers": singers_list}, status=200)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse({"error": "Invalid request"}, status=405)

@csrf_exempt
def get_singer_by_id(request, singer_id):
    if request.method == "GET":
        try:
            singer = Singer.objects.get(id=singer_id)
            singer_data = {
                "id": str(singer.id),
                "fullName": singer.fullName,
                "avatar": singer.avatar,
                "status": singer.status,
                "slug": singer.slug,
                "deleted": singer.deleted,
                "deletedAt": singer.deletedAt,
                "createdAt": singer.createdAt.strftime('%d/%m/%Y %H:%M:%S') if singer.createdAt else None,
                "updatedAt": singer.updatedAt.strftime('%d/%m/%Y %H:%M:%S') if singer.updatedAt else None
            }
            return JsonResponse({"singer": singer_data}, status=200)
        except ObjectDoesNotExist:
            return JsonResponse({"error": "Ca sĩ không tồn tại."}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse({"error": "Invalid request"}, status=405)

@csrf_exempt
def patch_singer(request, singer_id):
    if request.method == "PATCH":
        try:
            body =json.loads(request.body)
            singer = Singer.objects.get(id=singer_id)
            
            # Cập nhật các trường nếu có trong body
            if 'fullName' in body:
                singer.fullName = body['fullName']
            if 'avatar' in body:
                singer.avatar = body['avatar']
            if 'status' in body:
                singer.status = body['status']
            if 'slug' in body:
                singer.slug = body['slug']

            singer.save()
            
            return JsonResponse({"message": "Cập nhật ca sĩ thành công."}, status=200)
        except ObjectDoesNotExist:
            return JsonResponse({"error": "Ca sĩ không tồn tại."}, status=404)
        except ValidationError as e:
            return JsonResponse({"error": str(e)}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse({"error": "Invalid request"}, status=405)

@csrf_exempt
def create_singer(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)

            # Lấy dữ liệu từ request
            full_name = data.get("fullName", "").strip()
            avatar = data.get("avatar", "")
            status = data.get("status", "active")

            # Kiểm tra các trường bắt buộc
            if not full_name:
                return JsonResponse({"error": "Tên ca sĩ không được để trống!"}, status=400)

            # Kiểm tra xem ca sĩ đã tồn tại chưa
            if Singer.objects.filter(fullName=full_name).first():
                return JsonResponse({"error": "Ca sĩ đã tồn tại!"}, status=400)

            # Tạo ca sĩ mới
            singer = Singer(
                fullName=full_name,
                avatar=avatar,
                status=status,
            )
            singer.save()

            return JsonResponse({"message": "Tạo ca sĩ thành công!", "singer_id": str(singer.id)}, status=201)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Dữ liệu gửi lên không phải JSON hợp lệ!"}, status=400)
        except ValidationError as e:
            return JsonResponse({"error": str(e)}, status=400)
        except Exception as e:
            return JsonResponse({"error": f"Lỗi hệ thống: {str(e)}"}, status=500)

    return JsonResponse({"error": "Invalid request"}, status=405)

@csrf_exempt
def delete_singer(request, singer_id):
    if request.method == "DELETE":
        try:
            singer = singer = Singer.objects.filter(id=singer_id).first()

            if not singer:
                return JsonResponse({"error": "Ca sĩ không tồn tại."}, status=404)
            
            singer.deleted = True
            singer.status = "inactive"
            singer.save()
            
            return JsonResponse({"message": "Xoá ca sĩ thành công!", "singer_id": str(singer.id)}, status=201)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Dữ liệu gửi lên không phải JSON hợp lệ!"}, status=400)
        except ValidationError as e:
            return JsonResponse({"error": str(e)}, status=400)
        except Exception as e:
            return JsonResponse({"error": f"Lỗi hệ thống: {str(e)}"}, status=500)

    return JsonResponse({"error": "Invalid request"}, status=405)