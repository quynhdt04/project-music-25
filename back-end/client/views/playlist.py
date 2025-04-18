from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from asgiref.sync import sync_to_async
from models.play_list import PlayList
import datetime

@csrf_exempt
async def get_all_playList(request):
    if request.method == "GET":
        try:
            playLists = await sync_to_async(lambda: list(PlayList.objects.filter(deleted=False)))()

            play_list = [
                {
                    "id": str(play.id),
                    "userId": play.userId,
                    "title": play.title,
                    "imageAlbum": play.imageAlbum,
                    "songs": play.songs if play.songs else [],
                    "deleted": play.deleted,
                    "deletedAt": play.deletedAt,
                    "createdAt": play.createdAt,
                    "updatedAt": play.updatedAt
                }
                for play in playLists
            ]
            return JsonResponse({"playList": play_list}, status=200)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "Invalid request"}, status=405)


@csrf_exempt
async def create_playlist(request):
    if request.method == "POST":
        try:
            body = json.loads(request.body)

            user_id = body.get("userId")
            title = body.get("title")
            image_album = body.get("imageAlbum", "")
            songs = body.get("songs", [])  # Mảng ID bài hát

            if not user_id or not title:
                return JsonResponse({"error": "userId và title là bắt buộc!"}, status=400)

            new_playlist = PlayList(
                userId=user_id,
                title=title,
                imageAlbum=image_album,
                songs=songs,
                createdAt=datetime.datetime.utcnow(),
                updatedAt=datetime.datetime.utcnow(),
                deleted=False,
                deletedAt=None
            )

            await sync_to_async(new_playlist.save)()

            return JsonResponse({"message": "Tạo playlist thành công!", "playlistId": str(new_playlist.id)}, status=201)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "Invalid request"}, status=405)