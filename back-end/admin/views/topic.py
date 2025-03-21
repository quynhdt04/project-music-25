from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from models.topic import Topic  # Giả định bạn đã tạo model Topic
from django.core.exceptions import ValidationError
from models.topic import Topic 


@csrf_exempt
def get_all_topics(request):
    print(">>> get_all_topics được gọi")
    if request.method == "GET":
        try:
            topics = Topic.objects.all()
            print("Số lượng topics:", topics.count())
            data = [topic.to_dict() for topic in topics]
            return JsonResponse({"topics": data}, status=200)
        except Exception as e:
            print("Lỗi DB:", e)
            return JsonResponse({"error": str(e)}, status=400)
@csrf_exempt
def create_topic(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            name = data.get("name", "").strip()
            description = data.get("description", "").strip()
            status = data.get("status", "active")

            # Validate
            if not name:
                return JsonResponse({"error": "Tên chủ đề không được để trống!"}, status=400)

            # Kiểm tra trùng tên
            if Topic.objects(name=name).first():
                return JsonResponse({"error": "Tên chủ đề đã tồn tại!"}, status=400)

            topic = Topic(
                name=name,
                description=description,
                status=status
            )
            topic.save()

            return JsonResponse({"message": "Tạo chủ đề thành công!", "topic_id": str(topic.id)}, status=201)

        except ValidationError as e:
            return JsonResponse({"error": str(e)}, status=400)
        except Exception as e:
            return JsonResponse({"error": f"Lỗi hệ thống: {str(e)}"}, status=500)

    return JsonResponse({"error": "Invalid request"}, status=405)


@csrf_exempt
def update_topic_status(request, topic_id):
    if request.method == "PUT":
        try:
            data = json.loads(request.body)
            new_status = data.get("status")

            if new_status not in ["active", "inactive"]:
                return JsonResponse({"error": "Trạng thái không hợp lệ!"}, status=400)

            topic = Topic.objects.get(id=topic_id)
            topic.status = new_status
            topic.save()

            return JsonResponse({"message": "Cập nhật trạng thái thành công"}, status=200)

        except Topic.DoesNotExist:
            return JsonResponse({"error": "Không tìm thấy chủ đề!"}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request"}, status=405)
