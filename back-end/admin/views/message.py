from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import logging
from django.core.exceptions import ValidationError
from models.message import Message
import uuid

logger = logging.getLogger(__name__)

@csrf_exempt
def get_messages_by_conversation(request, conversation_id):
    if request.method == 'GET':
        try:
            messages = list(Message.objects.filter(
                conversation_id=conversation_id,
                deleted=False
            ).order_by('createdAt'))

            messages_list = [{
                "id": str(msg.id),
                "conversation_id": msg.conversation_id,
                "sender_id": msg.sender_id,
                "sender_name": msg.sender_name,
                "sender_avatar": msg.sender_avatar,
                "content": msg.content,
                "type": msg.type,
                "deleted": msg.deleted,
                "createdAt": msg.createdAt.isoformat() if msg.createdAt else None,
                "deletedAt": msg.deletedAt.isoformat() if msg.deletedAt else None
            } for msg in messages]

            return JsonResponse({"messages": messages_list}, status=200)

        except Exception as e:
            logger.exception("Error fetching messages")
            return JsonResponse({"error": str(e)}, status=500)
    else:
        return JsonResponse({"error": "Invalid request method"}, status=405)

@csrf_exempt
def create_message(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            id = data.get("id")  # UUID do client tạo
            conversation_id = data.get("conversation_id")
            sender_id = data.get("sender_id")
            sender_name = data.get("sender_name")
            sender_avatar = data.get("sender_avatar")
            content = data.get("content", "").strip()
            msg_type = data.get("type", "TEXT")  # TEXT / IMAGE / ICON

            # Kiểm tra dữ liệu bắt buộc
            if not conversation_id or not sender_id or not content:
                return JsonResponse({"error": "Thiếu dữ liệu bắt buộc!"}, status=400)
            
            # Nếu không có ID, server tự sinh ID mới
            if not id:
                id = str(uuid.uuid4())  # Tạo UUID mới nếu không có ID từ client

            # Tạo message với thông tin đầy đủ
            message = Message(
                id = id,
                conversation_id=conversation_id,
                sender_id=sender_id,
                sender_name=sender_name,
                sender_avatar=sender_avatar,
                content=content,
                type=msg_type
            )
            message.save()

            return JsonResponse({
                "message": "Tạo tin nhắn thành công!",
                "id": str(message.id),
            }, status=201)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Dữ liệu JSON không hợp lệ!"}, status=400)
        except ValidationError as e:
            return JsonResponse({"error": str(e)}, status=400)
        except Exception as e:
            logger.exception("Lỗi khi tạo message:")
            return JsonResponse({"error": f"Lỗi hệ thống: {str(e)}"}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=405)