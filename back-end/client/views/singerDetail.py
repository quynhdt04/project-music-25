from django.http import JsonResponse
from django.core.exceptions import ValidationError, ObjectDoesNotExist
from models.song import Song
from django.views.decorators.csrf import csrf_exempt
import json
from django.utils import timezone
@csrf_exempt
def get_songs_by_singerID(request, singer_id):
    if request.method == "GET":
        try:
            # Tìm tất cả bài hát có ca sĩ có singerId trùng với singer_id
            songs = Song.objects(singers__singerId=singer_id, deleted=False) # Tìm bài hát chưa bị xóa

            # Nếu không có bài hát nào, trả về thông báo lỗi
            if not songs:
                return JsonResponse({"error": "Không tìm thấy bài hát của ca sĩ này."}, status=404)

            # Lấy dữ liệu bài hát để trả về
            songs_data = [{
                "_id": str(song._id),
                "title": song.title,
                "avatar": song.avatar,
                "audio": song.audio,
                "video": song.video,
                "description": song.description,
                "like": song.like,
                "userLiked": song.userLiked,
                "status": song.status,
                "isPremiumOnly": song.isPremiumOnly,
                "createdBy": song.createdBy,
                "approvedBy": song.approvedBy,
                "play_count": song.play_count,
                "deleted": song.deleted,
                "slug": song.slug,
                "createdAt": song.createdAt.strftime('%d/%m/%Y %H:%M:%S') if song.createdAt else None,
                "updatedAt": song.updatedAt.strftime('%d/%m/%Y %H:%M:%S') if song.updatedAt else None
            } for song in songs]
            return JsonResponse({"songs": songs_data}, status=200)
        
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "Invalid request"}, status=405)
