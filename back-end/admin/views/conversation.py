from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.utils import timezone

from models.user import User
from models.conversation import Conversation

import uuid
import logging
logger = logging.getLogger(__name__)

@csrf_exempt
def create_conversation(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            name = data.get("name", "").strip()
            img =  data.get("img", "")
            status = data.get("status", "active")

            # Kiểm tra các trường bắt buộc
            if not name:
                return JsonResponse({"error": "Tên cuộc trò chuyện không được để trống!"}, status=400)

            # Tạo cuộc trò chuyện mới
            conversation = Conversation(
                name = name,
                img = img,
                status=status,
            )           
            conversation.save()
            return JsonResponse({"message": "Tạo cuộc trò chuyện thành công!", "conversation_id": str(conversation.id)}, status=201)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Dữ liệu gửi lên không phải JSON hợp lệ!"}, status=400)
        except ValidationError as e:
            return JsonResponse({"error": str(e)}, status=400)
        except Exception as e:
            return JsonResponse({"error": f"Lỗi hệ thống: {str(e)}"}, status=500)
    return JsonResponse({"error": "Invalid request"}, status=405)

@csrf_exempt
def get_all_conversations(request):
    if request.method == 'GET':
        try:
            conversations = list(Conversation.objects.filter(deleted=False))
            conversations_list = [{
                "id": str(conv.id),
                "name": conv.name,
                "img": conv.img,
                "status": conv.status,
                "deleted": conv.deleted,
                "deletedAt": conv.deletedAt,
                "createdAt": conv.createdAt.strftime('%d/%m/%Y %H:%M:%S') if conv.createdAt else None,
                "updatedAt": conv.updatedAt.strftime('%d/%m/%Y %H:%M:%S') if conv.updatedAt else None
            } for conv in conversations]
            return JsonResponse({"conversations": conversations_list}, status=200)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse({"error": "Invalid request"}, status=405)

@csrf_exempt
def get_conversation_by_id(request, conversation_id):
    if request.method == 'GET':
        try:
            conv = Conversation.objects(id=conversation_id, deleted=False).first()
            if not conv:
                return JsonResponse({"error": "Cuộc trò chuyện không tồn tại."}, status=404)

            conversation_data = {
                "id": str(conv.id),
                "name": conv.name,
                "img": conv.img,
                "status": conv.status,
                "deleted": conv.deleted,
                "deletedAt": conv.deletedAt,
                "createdAt": conv.createdAt.strftime('%d/%m/%Y %H:%M:%S') if conv.createdAt else None,
                "updatedAt": conv.updatedAt.strftime('%d/%m/%Y %H:%M:%S') if conv.updatedAt else None
            }
            return JsonResponse({"conversation": conversation_data}, status=200)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse({"error": "Invalid request"}, status=405)


@csrf_exempt
def update_conversation(request, conversation_id):
    if request.method == 'PATCH':
        try:
            body = json.loads(request.body)
            conv = Conversation.objects(id=conversation_id, deleted=False).first()
            if not conv:
                return JsonResponse({"error": "Cuộc trò chuyện không tồn tại."}, status=404)

            if 'name' in body:
                conv.name = body['name']
            if 'img' in body:
                conv.img = body['img']
            conv.save()

            return JsonResponse({"message": "Cập nhật cuộc trò chuyện thành công."}, status=200)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse({"error": "Invalid request"}, status=405)

@csrf_exempt
def delete_conversation(request, conversation_id):
    if request.method == 'DELETE':
        try:
            conv = Conversation.objects(id=conversation_id, deleted=False).first()
            if not conv:
                return JsonResponse({"error": "Không tìm thấy cuộc trò chuyện"}, status=404)

            conv.deleted = True
            conv.status = "inactive"
            conv.save()

            return JsonResponse({"message": "Xoá cuộc trò chuyện thành công!", "conversation_id": str(conv.id)}, status=201)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Dữ liệu gửi lên không phải JSON hợp lệ!"}, status=400)
        except ValidationError as e:
            return JsonResponse({"error": str(e)}, status=400)
        except Exception as e:
            return JsonResponse({"error": f"Lỗi hệ thống: {str(e)}"}, status=500)
    return JsonResponse({"error": "Invalid request"}, status=405)