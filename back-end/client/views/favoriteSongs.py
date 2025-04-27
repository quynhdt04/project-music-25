from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from asgiref.sync import sync_to_async
from models.favorite_songs import FavoriteSong
import datetime

@csrf_exempt
async def get_favorite_songs(request, user_id):
    if request.method != "GET":
        return JsonResponse({"error": "Chỉ hỗ trợ phương thức GET."}, status=405)

    @sync_to_async
    def fetch_fav_songs():
        fav = FavoriteSong.objects(userId=user_id, deleted=False).first()
        if fav:
            return {
                "favoriteSongId": str(fav.id),
                "songList": fav.songId
            }
        else:
            return None

    try:
        result = await fetch_fav_songs()

        if result:
            return JsonResponse({
                "favoriteSongId": result["favoriteSongId"],
                "songs": result["songList"]
            }, status=200)
        else:
            return JsonResponse({
                "message": "Không tìm thấy danh sách yêu thích cho người dùng này.",
                "songs": []
            }, status=404)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
async def create_favorite_song(request):
    if request.method != "POST":
        return JsonResponse({"error": "Chỉ hỗ trợ phương thức POST."}, status=405)

    try:
        body = json.loads(request.body.decode("utf-8"))

        user_id = body.get("userId")
        song_id = body.get("songId")  # chỉ 1 bài hát (string)

        if not user_id or not song_id:
            return JsonResponse({"error": "Thiếu userId hoặc songId."}, status=400)

        @sync_to_async
        def toggle_fav_song():
            fav = FavoriteSong.objects(userId=user_id, deleted=False).first()

            if fav:
                if song_id in fav.songId:
                    fav.songId.remove(song_id)  # Unfavorite
                    action = "removed"
                else:
                    fav.songId.append(song_id)  # Favorite
                    action = "added"

                fav.updatedAt = datetime.datetime.now(datetime.timezone.utc)
                fav.save()
            else:
                fav = FavoriteSong(userId=user_id, songId=[song_id])
                fav.save()
                action = "added"

            return {
                "id": str(fav.id),
                "action": action,
                "songList": fav.songId
            }

        result = await toggle_fav_song()

        return JsonResponse({
            "message": f"Bài hát đã được {result['action']}.",
            "favoriteSongId": result["id"],
            "currentSongs": result["songList"]
        }, status=200)

    except json.JSONDecodeError:
        return JsonResponse({"error": "Dữ liệu JSON không hợp lệ."}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
