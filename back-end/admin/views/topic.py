from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from models.topic import Topic
from django.core.exceptions import ValidationError
from slugify import slugify 
from django.utils import timezone
from asgiref.sync import sync_to_async
import logging
import traceback
# import slugify

logger = logging.getLogger(__name__)
print(slugify("Tiêu đề bài hát mới")) 

# Lấy danh sách tất cả chủ đề
@csrf_exempt
async def get_all_topics(request):
    if request.method == "GET":
        try:
            topics = await sync_to_async(list)(Topic.objects.all())
            data = [topic.to_dict() for topic in topics]
            return JsonResponse({"topics": data}, status=200)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

# Tạo chủ đề mới
@csrf_exempt
def create_topic(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            title = (data.get("title") or "").strip()
            description = (data.get("description") or "").strip()
            avatar = (data.get("avatar") or "").strip()
            status = (data.get("status") or "active").strip()

            print("Dữ liệu nhận từ client:", data)  # 👈 Log dữ liệu nhận được

            if not title:
                return JsonResponse({"error": "Tên chủ đề không được để trống!"}, status=400)

            if Topic.objects(title=title).first():
                return JsonResponse({"error": "Tên chủ đề đã tồn tại!"}, status=400)

            topic = Topic(
                title=title,
                slug=slugify(title),
                description=description,
                avatar=avatar,
                status=status
            )
            topic.save()

            return JsonResponse({
                "message": "Tạo chủ đề thành công!",
                "topic": topic.to_dict()
            }, status=201)

        except ValidationError as e:
            print("ValidationError:", e)
            return JsonResponse({"error": str(e)}, status=400)
        except Exception as e:
            print("Exception xảy ra:", e)
            return JsonResponse({"error": f"Lỗi hệ thống: {str(e)}"}, status=500)

    return JsonResponse({"error": "Invalid request"}, status=405)


# Lấy chi tiết chủ đề theo ID
@csrf_exempt
def get_topic_by_id(request, topic_id):
    if request.method == "GET":
        try:
            topic = Topic.objects.get(id=topic_id)
            return JsonResponse({"topic": topic.to_dict()}, status=200)
        except Topic.DoesNotExist:
            return JsonResponse({"error": "Không tìm thấy chủ đề!"}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request"}, status=405)


# Chỉnh sửa chủ đề


@csrf_exempt
def update_topic(request, topic_id):
    if request.method == "PUT":
        try:
            # Lấy chủ đề từ ID
            topic = Topic.objects.get(id=topic_id)
            
            # Lấy dữ liệu từ request body
            data = json.loads(request.body)
            
            # Kiểm tra xem title có tồn tại trong data không
            if not data.get("title"):
                return JsonResponse({"error": "Title is required."}, status=400)
            
            # Cập nhật các trường của chủ đề
            topic.title = data.get("title", topic.title)
            topic.slug = slugify(data.get("slug", data.get("title")))  # Tự động tạo slug từ title nếu không có slug
            topic.avatar = data.get("avatar", topic.avatar)
            topic.description = data.get("description", topic.description)
            topic.status = data.get("status", topic.status)
            topic.updated_at = timezone.now()  # Cập nhật thời gian

            # Lưu chủ đề vào cơ sở dữ liệu
            topic.save()

            return JsonResponse({
    "message": "Cập nhật chủ đề thành công.",
    "topic": topic.to_dict()
}, status=200)
        except Topic.DoesNotExist:
            return JsonResponse({"error": "Chủ đề không tồn tại."}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    else:
        return JsonResponse({"error": "Phương thức không hợp lệ."}, status=405)

# Xóa chủ đề
@csrf_exempt
def delete_topic(request, topic_id):
    if request.method == 'DELETE':
        try:
            topic = Topic.objects.get(id=topic_id)
            topic.delete()
            return JsonResponse({"message": "Chủ đề đã được xóa thành công!"}, status=200)
        except Topic.DoesNotExist:
            return JsonResponse({"error": "Chủ đề không tồn tại!"}, status=404)
    return JsonResponse({"error": "Phương thức yêu cầu không hợp lệ!"}, status=405)  

@csrf_exempt
async def get_number_of_topics(request):
    if request.method == "GET":
        try:
            # Get the number from query parameters, default to 10 if not provided
            number = int(request.GET.get('limit', 10))
            
            topics = await sync_to_async(list)(Topic.objects.all().limit(number))
            data = [topic.to_dict() for topic in topics]
            return JsonResponse({"data": data, "status": 200, "message": "Lấy chủ đề thành công theo số lượng thành công!"}, status=200)
        except ValueError:
            return JsonResponse({"error": "Invalid limit parameter. Must be a number."}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse({"error": "Phương thức yêu cầu không hợp lệ!"}, status=405)

@csrf_exempt
async def get_topic_by_slug(request, topic_slug):
    if request.method == "GET":
        try:
            # Get the topic by slug
            topic = await sync_to_async(Topic.objects.get)(slug=topic_slug)
            # Convert to dict to access fields safely
            topic_dict = await sync_to_async(topic.to_dict)()
            return JsonResponse({"topic": topic_dict}, status=200)
        except Topic.DoesNotExist:
            return JsonResponse({"error": "Chủ đề không tồn tại!"}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse({"error": "Phương thức yêu cầu không hợp lệ!"}, status=405)
