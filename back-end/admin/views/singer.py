from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from asgiref.sync import sync_to_async
import json
from models.singer import Singer
from django.core.exceptions import ValidationError, ObjectDoesNotExist
from django.utils import timezone


@csrf_exempt
async def get_all_singers(request):
    if request.method == "GET":
        try:
            singers = await sync_to_async(lambda: list(Singer.objects.filter(deleted=False)))()
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
async def get_singer_by_id(request, singer_id):
    if request.method == "GET":
        try:
            singer = await sync_to_async(lambda: Singer.objects.get(id=singer_id))()
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
async def patch_singer(request, singer_id):
    if request.method == "PATCH":
        try:
            body = await sync_to_async(lambda: json.loads(request.body))()
            singer = await sync_to_async(lambda: Singer.objects.get(id=singer_id))()
            
            # Cập nhật các trường nếu có trong body
            if 'fullName' in body:
                singer.fullName = body['fullName']
            if 'avatar' in body:
                singer.avatar = body['avatar']
            if 'status' in body:
                singer.status = body['status']
            if 'slug' in body:
                singer.slug = body['slug']
            
            # Tự động cập nhật updatedAt
            singer.updatedAt = timezone.now()
            
            await sync_to_async(singer.save)()
            
            return JsonResponse({"message": "Cập nhật ca sĩ thành công."}, status=200)
        except ObjectDoesNotExist:
            return JsonResponse({"error": "Ca sĩ không tồn tại."}, status=404)
        except ValidationError as e:
            return JsonResponse({"error": str(e)}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse({"error": "Invalid request"}, status=405)
