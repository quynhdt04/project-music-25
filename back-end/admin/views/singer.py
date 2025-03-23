from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from models.singer import Singer
from django.core.exceptions import ValidationError
from asgiref.sync import sync_to_async
import logging
import traceback
logger = logging.getLogger(__name__)

@csrf_exempt
async def get_all_singers(request):
    if request.method == "GET":
        try:
            singers = await sync_to_async(list)(Singer.objects.all())
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