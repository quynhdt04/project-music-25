from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from asgiref.sync import sync_to_async
from models.account import Account
from models.user import User
from models.album import Album
from models.song import Song
from models.singer import Singer
from models.topic import Topic

@csrf_exempt
async def get_total_statistics(request):
    if request.method == "GET":
        try:
            stats = {
                "total_accounts": await sync_to_async(lambda: Account.objects(deleted=False).count())(),
                "total_users": await sync_to_async(lambda: User.objects(deleted=False).count())(),
                "total_singers": await sync_to_async(lambda: Singer.objects(deleted=False).count())(),
                "total_albums": await sync_to_async(lambda: Album.objects(deleted=False).count())(),
                "total_songs": await sync_to_async(lambda: Song.objects(deleted=False).count())(),
            }
            return JsonResponse({"statistics": stats}, status=200)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
async def get_playcount_by_topic(request):
    if request.method == "GET":
        try:
            # Lấy tất cả các topic chưa bị xóa
            topics = await sync_to_async(lambda: list(Topic.objects(deleted=False)))()

            # Tạo dict lưu play_count mặc định = 0 cho mỗi topic
            topic_playcount = {
                str(topic.id): {
                    "topicName": topic.title,
                    "play_count": 0
                }
                for topic in topics
            }

            # Lấy tất cả các bài hát chưa bị xóa
            songs = await sync_to_async(lambda: list(Song.objects(deleted=False)))()

            # Duyệt từng bài hát để cộng play_count vào topic tương ứng
            for song in songs:
                for embedded_topic in song.topics:
                    topic_id = embedded_topic.topicId
                    if topic_id in topic_playcount:
                        topic_playcount[topic_id]["play_count"] += song.play_count

            # Chuyển dict thành list
            result = [
                {
                    "topicId": topic_id,
                    "topicName": value["topicName"],
                    "play_count": value["play_count"]
                }
                for topic_id, value in topic_playcount.items()
            ]

            return JsonResponse({"data": result}, status=200)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
async def get_songcount_by_topic(request):
    if request.method == "GET":
        try:
            # Lấy tất cả các topic chưa bị xóa
            topics = await sync_to_async(lambda: list(Topic.objects(deleted=False)))()

            # Tạo dict lưu số lượng bài hát mặc định = 0 cho mỗi topic
            topic_songcount = {
                str(topic.id): {
                    "topicName": topic.title,
                    "song_count": 0
                }
                for topic in topics
            }

            # Lấy tất cả các bài hát chưa bị xóa
            songs = await sync_to_async(lambda: list(Song.objects(deleted=False)))()

            # Duyệt từng bài hát để cộng số lượng bài hát vào topic tương ứng
            for song in songs:
                for embedded_topic in song.topics:
                    topic_id = embedded_topic.topicId
                    if topic_id in topic_songcount:
                        topic_songcount[topic_id]["song_count"] += 1

            # Chuyển dict thành list để trả về
            result = [
                {
                    "topicId": topic_id,
                    "topicName": value["topicName"],
                    "song_count": value["song_count"]
                }
                for topic_id, value in topic_songcount.items()
            ]

            return JsonResponse({"data": result}, status=200)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
async def get_top_liked_songs(request):
    if request.method == "GET":
        try:
            # Lấy danh sách các bài hát chưa bị xóa và sắp xếp giảm dần theo lượt like
            songs = await sync_to_async(
                lambda: list(Song.objects(deleted=False).order_by("-like").limit(6))
            )()

            # Chuyển đổi dữ liệu để trả về
            result = [
                {
                    "songId": song._id,
                    "title": song.title,
                    "like": song.like,
                    "play_count": song.play_count,
                    "singers": [s.singerName for s in song.singers]
                }
                for song in songs
            ]

            return JsonResponse({"data": result}, status=200)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
