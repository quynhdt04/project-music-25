from datetime import datetime, UTC, timezone
import cloudinary
from cloudinary.uploader import destroy
from django.http import QueryDict
from django.http import JsonResponse
from django.http.multipartparser import MultiPartParser, MultiPartParserError
import hashlib
from django.views.decorators.csrf import csrf_exempt
from asgiref.sync import sync_to_async
import json
from slugify import slugify
from models.song import Song, Singer, Topic, Lyric
from models.topic import Topic as TopicModel
from models.singer import Singer as SingerModel
from models.favorite_songs import FavoriteSong
from models.album import Album
import logging
import traceback
from mongoengine.queryset.visitor import Q
logger = logging.getLogger(__name__)

@csrf_exempt
async def list_all_song(request):
    if request.method == "GET":
        try:
            songs = await sync_to_async(Song.objects.all)()
            songs = await sync_to_async(list)(songs)

            serialized_songs = []
            for song in songs:
                # Get all albums for this song
                albums = await sync_to_async(list)(Album.objects.filter(songs__in=[song._id]))
                
                if albums:
                    serialized_albums = []
                    for album in albums:
                        try:
                            singer = await sync_to_async(SingerModel.objects.get)(id=album.singerId)
                            serialized_album = {
                                "id": str(album._id),
                                "title": album.title,
                                "singer": {
                                    "id": str(singer.id),
                                    "fullName": singer.fullName
                                }
                            }
                        except SingerModel.DoesNotExist:
                            serialized_album = {
                                "id": str(album._id),
                                "title": album.title,
                                "singer": None
                            }
                        serialized_albums.append(serialized_album)
                else:
                    serialized_albums = []
                
                # Serialize the song
                serialized_song = {
                    "_id": str(song._id),
                    "title": song.title,
                    "singers": [{"singerId": singer.singerId, "singerName": singer.singerName} for singer in song.singers],
                    "topics": [{"topicId": topic.topicId, "topicName": topic.topicName} for topic in song.topics],
                    "like": song.like,
                    "lyrics": [{"lyricContent": lyric.lyricContent, "lyricStartTime": lyric.lyricStartTime, "lyricEndTime": lyric.lyricEndTime} for lyric in song.lyrics],
                    "status": song.status,
                    "avatar": song.avatar,
                    "audio": song.audio,
                    "video": song.video,
                    "description": song.description,
                    "isPremiumOnly": song.isPremiumOnly,
                    "play_count": song.play_count,
                    "slug": song.slug,
                    "albums": serialized_albums,  
                    "deleted": song.deleted,
                    "createdAt": song.createdAt,
                    "updatedAt": song.updatedAt
                }
                serialized_songs.append(serialized_song)

            return JsonResponse({"data": serialized_songs, "message": "Get all songs successfully", "status": 200}, status=200)
        
        except Exception as e:
            logger.error("Error in list_all_song: %s", traceback.format_exc())
            return JsonResponse({"message": f"Lỗi hệ thống: {str(e)}", "status": 500}, status=500)
    return JsonResponse({"message": "Chức năng đang được phát triển", "status": 501}, status=501)

def generate_public_id(file):
    # Generate a hash of the file content
    file_hash = hashlib.md5(file.read()).hexdigest()
    file.seek(0)  # Reset file pointer after reading
    return f"{file_hash}"

@csrf_exempt
async def upload_files_to_cloudinary(files):
    try:
        # Extract files from the request
        image_file = files.get("avatar")
        audio_file = files.get("audio")
        video_file = files.get("video")

        # Initialize results with default values
        image_url = None
        audio_url = None
        video_url = None

        # Upload files to Cloudinary only once
        if image_file:
            image_url = await upload_file_to_cloudinary(image_file, "Spotify/images", "image")
        
        if audio_file:
            audio_url = await upload_file_to_cloudinary(audio_file, "Spotify/audios", "video")
        
        if video_file:
            video_url = await upload_file_to_cloudinary(video_file, "Spotify/videos", "video")
        
        
        # Return the URLs of the uploaded files
        return JsonResponse({
            "message": "Files uploaded successfully!",
            "image_url": image_url if image_url else "",
            "audio_url": audio_url if audio_url else "",
            "video_url": video_url if video_url else "",
        }, status=200)

    except Exception as e:
        # Log the error for debugging
        logger.error("Error in upload_files_to_cloudinary: %s", traceback.format_exc())
        return JsonResponse({"error": f"Lỗi hệ thống: {str(e)}"}, status=500)    

async def upload_file_to_cloudinary(file, folder, type):
    try:
        # Upload the file to Cloudinary
        public_id = generate_public_id(file)
        result = cloudinary.uploader.upload_large(
            file,
            resource_type=type,
            folder=folder,
            public_id=public_id
        )

        return result["secure_url"]
    except Exception as e:
        # Log the error for debugging
        logger.error("Error in upload_file_to_cloudinary: %s", traceback.format_exc())
        return None

@csrf_exempt
async def create_new_song(request):
    if request.method == "POST":
        try:
            # Extract files from the request
            files = request.FILES

            # Upload files to Cloudinary
            upload_response = await upload_files_to_cloudinary(files)
            if upload_response.status_code != 200:
                return upload_response  # Return the error response if upload fails

            # Extract URLs from the upload response
            upload_data = json.loads(upload_response.content)
            avatar_url = upload_data.get("image_url", "")
            audio_url = upload_data.get("audio_url", "")
            video_url = upload_data.get("video_url", "")

            # Extract other data from the request
            _id = request.POST.get("songId", "")
            title = request.POST.get("title", "")
            description = request.POST.get("description", "")
            singers = json.loads(request.POST.get("singers", "[]"))
            topics = json.loads(request.POST.get("topics", "[]"))
            like = request.POST.get("like", "")
            lyrics = json.loads(request.POST.get("lyrics", "[]"))
            status = request.POST.get("status", "pending")
            deleted = request.POST.get("deleted", "false").lower() == "true"
            deletedAt = request.POST.get("deletedAt", None)
            isPremiumOnly = request.POST.get("isPremiumOnly", "false").lower() == "true"

            # Validate required fields
            if not title:
                return JsonResponse({"message": "Tiêu đề không được để trống!", "status": 400}, status=400)
            if not audio_url:
                return JsonResponse({"message": "Bài hát phải có file audio!", "status": 400}, status=400)
            if not singers:
                return JsonResponse({"message": "Bài hát phải thuộc ít nhất 1 ca sĩ!", "status": 400}, status=400)
            if not lyrics:
                return JsonResponse({"message": "Bài hát phải có lời!", "status": 400}, status=400)

            # Create a new song
            new_song = Song(
                _id=_id,
                title=title,
                avatar=avatar_url,
                audio=audio_url,
                video=video_url,
                description=description,
                singers=singers,
                topics=topics,
                like=like,
                lyrics=lyrics,
                status=status,
                deleted=deleted,
                deletedAt=deletedAt,
                isPremiumOnly=isPremiumOnly,
                slug=slugify(title),
            )
            await sync_to_async(new_song.save)()

            return JsonResponse({"message": "Tạo bài hát thành công!", "id": str(new_song._id), "status": 201}, status=201)

        except json.JSONDecodeError:
            return JsonResponse({"message": "Dữ liệu không hợp lệ!", "status": 400}, status=400)
        except Exception as e:
            logger.error("Error in create_new_song: %s", traceback.format_exc())
            return JsonResponse({"message": f"Lỗi hệ thống: {str(e)}", "status": 500}, status=500)
    return JsonResponse({"message": "Chức năng đang được phát triển", "status": 501}, status=501)
    
@csrf_exempt
async def get_song_by_id(request, song_id):
    if request.method == "GET":
        try:
            song = await sync_to_async(Song.objects.get)(_id=song_id)
            
            # Try to find the album that contains this song
            albums = await sync_to_async(list)(Album.objects.filter(songs__in=[song._id]))
            
            if albums:
                serialized_albums = []
                for album in albums:
                    try:
                        singer = await sync_to_async(SingerModel.objects.get)(id=album.singerId)
                        serialized_album = {
                            "id": str(album._id),
                            "title": album.title,
                            "singer": {
                                "id": str(singer.id),
                                "fullName": singer.fullName
                            }
                        }
                    except SingerModel.DoesNotExist:
                        serialized_album = {
                            "id": str(album._id),
                            "title": album.title,
                            "singer": None
                        }
                    serialized_albums.append(serialized_album)
            else:
                serialized_albums = []

            song_serialized = {
                "id": song._id,
                "title": song.title,
                "singers": [{"singerId": singer.singerId, "singerName": singer.singerName} for singer in song.singers],
                "topics": [{"topicId": topic.topicId, "topicName": topic.topicName} for topic in song.topics],
                "like": song.like,
                "lyrics": [{"lyricContent": lyric.lyricContent, "lyricStartTime": lyric.lyricStartTime, "lyricEndTime": lyric.lyricEndTime} for lyric in song.lyrics],
                "status": song.status,
                "avatar": song.avatar,
                "audio": song.audio,
                "video": song.video,
                "description": song.description,
                "isPremiumOnly": song.isPremiumOnly,
                "play_count": song.play_count,
                "slug": song.slug,
                "albums": serialized_albums,
                "createdAt": song.createdAt,
                "updatedAt": song.updatedAt
            }
            return JsonResponse({"data": song_serialized, "status": 200, "message": "Lấy bài hát thành công!"}, status=200)
        except Song.DoesNotExist:
            return JsonResponse({"message": "Bài hát không tồn tại!", "status": 404}, status=404)
        except Exception as e:
            return JsonResponse({"message": str(e)}, status=400)
    return JsonResponse({"message": "Chức năng đang được phát triển", "status": 501}, status=501)

@csrf_exempt
async def update_song_data(request, song_id):
    if request.method == "PUT":
        try:
            # Parse multipart/form-data manually
            if request.content_type.startswith("multipart/form-data"):
                try:
                    parser = MultiPartParser(request.META, request, request.upload_handlers)
                    data, files = parser.parse()
                except MultiPartParserError as e:
                    return JsonResponse({"error": f"Failed to parse multipart data: {str(e)}"}, status=400)
            else:
                # For non-multipart requests, parse JSON body
                data = QueryDict(request.body.decode("utf-8"))
                files = {}

            # Check if the song exists
            try:
                song = await sync_to_async(Song.objects.get)(_id=song_id)
            except Song.DoesNotExist:
                return JsonResponse({"error": "Bài hát không tồn tại!"}, status=404)

            # Check if the title is not empty
            if "title" in data:
                new_title = data.get("title", "")
                if not new_title:
                    return JsonResponse({"error": "Tiêu đề bài hát không được để trống!"}, status=400)

                song.title = new_title
            
            # Handle avatar update (file or URL)
            new_avatar_file = files.get("avatar")
            current_avatar_url = data.get("avatar")
            if new_avatar_file:
                # Delete the old avatar from Cloudinary
                if song.avatar:
                    old_avatar_public_id = song.avatar.split("/")[-1].split(".")[0]
                    destroy(f"Spotify/images/{old_avatar_public_id}")

                # Upload the new avatar to Cloudinary
                avatar_url = await upload_file_to_cloudinary(new_avatar_file, "Spotify/images", "image")
                song.avatar = avatar_url
            elif current_avatar_url:
                # Update the avatar URL directly
                song.avatar = current_avatar_url

            # Handle audio update (file or URL)
            new_audio_file = files.get("audio")
            current_audio_url = data.get("audio")
            if new_audio_file:
                # Delete the old audio from Cloudinary
                if song.audio:
                    old_audio_public_id = song.audio.split("/")[-1].split(".")[0]
                    destroy(f"Spotify/audios/{old_audio_public_id}", resource_type="video")

                # Upload the new audio to Cloudinary
                audio_url = await upload_file_to_cloudinary(new_audio_file, "Spotify/audios", "video")
                song.audio = audio_url
            elif current_audio_url:
                # Update the audio URL directly
                song.audio = current_audio_url

            # Handle video update (file or URL)
            new_video_file = files.get("video")
            current_video_url = data.get("video")
            if new_video_file:
                # Delete the old video from Cloudinary
                if song.video:
                    old_video_public_id = song.video.split("/")[-1].split(".")[0]
                    destroy(f"Spotify/videos/{old_video_public_id}", resource_type="video")

                # Upload the new video to Cloudinary
                video_url = await upload_file_to_cloudinary(new_video_file, "Spotify/videos", "video")
                song.video = video_url
            elif current_video_url:
                # Update the video URL directly
                song.video = current_video_url

            if "description" in data:
                song.description = data.get("description", "")

            if "singers" in data:
                singers_data = json.loads(data.get("singers", "[]"))
                song.singers = [Singer(**singer) for singer in singers_data]

            if "topics" in data:
                topics_data = json.loads(data.get("topics", "[]"))
                song.topics = [Topic(**topic) for topic in topics_data]

            if "like" in data:
                song.like = data.get("like", "")

            if "lyrics" in data:
                lyrics_data = json.loads(data.get("lyrics", "[]"))
                song.lyrics = [Lyric(**lyric) for lyric in lyrics_data]

            if "status" in data:
                song.status = data.get("status", "active")

            if "deleted" in data:
                song.deleted = data.get("deleted", "false").lower() == "true"

            if "deletedAt" in data:
                song.deletedAt = data.get("deletedAt", None)

            if "isPremiumOnly" in data:
                song.isPremiumOnly = data.get("isPremiumOnly", "false").lower() == "true"

            song.updatedAt = datetime.now(UTC)

            await sync_to_async(song.save)()
            return JsonResponse({"message": "Cập nhật bài hát thành công!", "id": song_id, "status": 200}, status=200)

        except json.JSONDecodeError:
            return JsonResponse({"message": "Dữ liệu không hợp lệ!", "status": 400}, status=400)
        except Exception as e:
            logger.error("Error in update_song_data: %s", traceback.format_exc())
            return JsonResponse({"message": f"Lỗi hệ thống: {str(e)}", "status": 500}, status=500)
    return JsonResponse({"message": "Chức năng đang được phát triển", "status": 501}, status=501)

@csrf_exempt
async def get_latest_song(request):
    if request.method == "GET":
        try:
            song = await sync_to_async(Song.objects.order_by("-createdAt").first)()

            serialized_song = {
                "_id": str(song._id),
                "title": song.title,
                "status": song.status,
                "deleted": song.deleted,
                "createdAt": song.createdAt.isoformat() if song.createdAt else None,
                "updatedAt": song.updatedAt.isoformat() if song.updatedAt else None,
            }

            return JsonResponse({"data": serialized_song, "message": "Get data successfully", "status": 200}, status=200)
        
        except Song.DoesNotExist:
            return JsonResponse({"message": "Không tìm thấy bài hát nào!", "status": 404}, status=404)
        except Exception as e:
            logger.error("Error in get_latest_song: %s", traceback.format_exc())
            return JsonResponse({"message": f"Lỗi hệ thống: {str(e)}", "status": 500}, status=500)
    return JsonResponse({"message": "Chức năng đang được phát triển", "status": 501}, status=501)

@csrf_exempt
async def delete_song_data(request, song_id):
    if request.method == "DELETE":
        try:
            # Check if the song exists
            song = await sync_to_async(Song.objects.get)(_id=song_id)

            # Perform a shallow delete
            song.deleted = True
            song.deletedAt = datetime.now(UTC)  # Set the deletion timestamp
            song.updatedAt = datetime.now(UTC)
            await sync_to_async(song.save)()

            return JsonResponse({"message": "Xóa bài hát thành công!", "status": 200}, status=200)
        
        except Song.DoesNotExist:
            return JsonResponse({"message": "Không tìm thấy bài hát!", "status": 404}, status=404)
        except Exception as e:
            logger.error("Error in delete_song_data: %s", traceback.format_exc())
            return JsonResponse({"message": f"Lỗi hệ thống: {str(e)}", "status": 500}, status=500)
    return JsonResponse({"message": "Chức năng đang được phát triển", "status": 501}, status=501)

@csrf_exempt
async def delete_multiple_songs(request):
    if request.method == "PATCH":
        try:
            data = json.loads(request.body)
            song_ids = data.get("songIds", [])

            # Delete each song by ID
            for song_id in song_ids:
                try:
                    song = await sync_to_async(Song.objects.get)(_id=song_id)
                    song.deleted = True
                    song.deletedAt = datetime.now(UTC)  # Set the deletion timestamp
                    song.updatedAt = datetime.now(UTC)
                    await sync_to_async(song.save)()
                except Song.DoesNotExist:
                    logger.warning(f"Song with ID {song_id} not found. Skipping.")
                    return JsonResponse({"message": f"Không tìm thấy bài hát với ID {song_id}!", "status": 404}, status=404)

            return JsonResponse({"message": "Xóa bài hát thành công!", "status": 200}, status=200)
        
        except Song.DoesNotExist:
            return JsonResponse({"message": "Không tìm thấy bài hát!", "status": 404}, status=404)
        except Exception as e:
            logger.error("Error in delete_multiple_songs: %s", traceback.format_exc())
            return JsonResponse({"message": f"Lỗi hệ thống: {str(e)}", "status": 500}, status=500)
    return JsonResponse({"message": "Chức năng đang được phát triển", "status": 501}, status=501)

@csrf_exempt
async def restore_multiple_songs(request):
    if request.method == "PATCH":
        try:
            data = json.loads(request.body)
            song_ids = data.get("songIds", [])

            # Restore each song by ID
            for song_id in song_ids:
                try:
                    song = await sync_to_async(Song.objects.get)(_id=song_id)
                    song.deleted = False
                    song.deletedAt = None  # Reset the deletion timestamp
                    song.updatedAt = datetime.now(UTC)
                    await sync_to_async(song.save)()
                except Song.DoesNotExist:
                    logger.warning(f"Song with ID {song_id} not found. Skipping.")
                    return JsonResponse({"message": f"Không tìm thấy bài hát với ID {song_id}!", "status": 404}, status=404)

            return JsonResponse({"message": "Khôi phục bài hát thành công!", "status": 200}, status=200)
        
        except Song.DoesNotExist:
            return JsonResponse({"message": "Không tìm thấy bài hát!", "status": 404}, status=404)
        except Exception as e:
            logger.error("Error in restore_multiple_songs: %s", traceback.format_exc())
            return JsonResponse({"message": f"Lỗi hệ thống: {str(e)}", "status": 500}, status=500)
    return JsonResponse({"message": "Chức năng đang được phát triển", "status": 501}, status=501)

@csrf_exempt
async def get_all_pending_songs(request):
    if request.method == "GET":
        try:
            songs = await sync_to_async(lambda: list(Song.objects.filter(status="pending", deleted=False).order_by("updatedAt")))()
            songs = await sync_to_async(list)(songs)

            # Serialize the songs into JSON-compatible data
            serialized_songs = [
                {
                    "_id": str(song._id),
                    "title": song.title,
                    "singers": [
                        {"singerId": singer.singerId, "singerName": singer.singerName} for singer in song.singers
                    ],  # Serialize each Singer object
                    "status": song.status,
                    "isPremiumOnly": song.isPremiumOnly,
                    "createdBy": song.createdBy,
                    "updatedAt": song.updatedAt,
                }
                for song in songs
            ]

            return JsonResponse({"data": serialized_songs, "message": "Get data successfully", "status": 200}, status=200)
        
        except Exception as e:
            logger.error("Error in get_all_pending_song: %s", traceback.format_exc())
            return JsonResponse({"error": f"Lỗi hệ thống: {str(e)}", "status": 500}, status=500)
    return JsonResponse({"error": "Chức năng đang được phát triển", "status": 501}, status=501)

@csrf_exempt
async def get_number_of_top_liked_songs(request):
    if request.method == "GET":
        try:
            # Get the number from query parameters, default to 10 if not provided
            number = int(request.GET.get('limit', 10))

            number_of_top_liked_songs = await sync_to_async(list)(Song.objects.filter(deleted=False).order_by("-like").limit(number))
            data = [{
                "_id": str(song._id),
                "title": song.title,
                "avatar": song.avatar,
                "audio": song.audio,
                "video": song.video,
                "description": song.description,
                "singers": [{"singerId": singer.singerId, "singerName": singer.singerName} for singer in song.singers],
                "topics": [{"topicId": topic.topicId, "topicName": topic.topicName} for topic in song.topics],
                "like": song.like,
                "lyrics": [{"lyricContent": lyric.lyricContent, "lyricStartTime": lyric.lyricStartTime, "lyricEndTime": lyric.lyricEndTime} for lyric in song.lyrics],
                "status": song.status,
                "isPremiumOnly": song.isPremiumOnly,
                "play_count": song.play_count,
                "slug": song.slug,
                "createdAt": song.createdAt,
                "updatedAt": song.updatedAt
            } for song in number_of_top_liked_songs]
            return JsonResponse({"data": data, "status": 200, "message": "Lấy bài hát thành công theo số lượng thành công!"}, status=200)
        except Exception as e:
            return JsonResponse({"message": str(e), "status": 400}, status=400)
    return JsonResponse({"message": "Phương thức yêu cầu không hợp lệ!", "status": 405}, status=405)

@csrf_exempt
async def get_number_of_top_play_count_songs(request):
    if request.method == "GET":
        try:
            # Get the number from query parameters, default to 10 if not provided
            number = int(request.GET.get('limit', 10))

            number_of_top_played_songs = await sync_to_async(list)(Song.objects.filter(deleted=False).order_by("-play_count").limit(number))
            data = [{
                "_id": str(song._id),
                "title": song.title,
                "avatar": song.avatar,
                "audio": song.audio,
                "video": song.video,
                "description": song.description,
                "singers": [{"singerId": singer.singerId, "singerName": singer.singerName} for singer in song.singers],
                "topics": [{"topicId": topic.topicId, "topicName": topic.topicName} for topic in song.topics],
                "like": song.like,
                "lyrics": [{"lyricContent": lyric.lyricContent, "lyricStartTime": lyric.lyricStartTime, "lyricEndTime": lyric.lyricEndTime} for lyric in song.lyrics],
                "status": song.status,
                "isPremiumOnly": song.isPremiumOnly,
                "play_count": song.play_count,
                "slug": song.slug,
                "createdAt": song.createdAt,
                "updatedAt": song.updatedAt
            } for song in number_of_top_played_songs]
            return JsonResponse({"data": data, "status": 200, "message": "Lấy bài hát thành công theo số lượng thành công!"}, status=200)
        except Exception as e:
            return JsonResponse({"message": str(e), "status": 400}, status=400)
    return JsonResponse({"message": "Phương thức yêu cầu không hợp lệ!", "status": 405}, status=405)

@csrf_exempt
async def get_songs_by_topic(request, topic_slug):
    if request.method == "GET":
        try:
            # Get topic and its songs
            topic = await sync_to_async(TopicModel.objects.get)(slug=topic_slug)
            topic_dict = await sync_to_async(topic.to_dict)()
            
            # Get all songs for this topic
            songs = await sync_to_async(list)(Song.objects.filter(topics__topicId=topic_dict['id'], deleted=False))
            
            serialized_songs = []
            for song in songs:
                # Get all albums for this song
                albums = await sync_to_async(list)(Album.objects.filter(songs__in=[song._id]))
                
                if albums:
                    serialized_albums = []
                    for album in albums:
                        try:
                            singer = await sync_to_async(SingerModel.objects.get)(id=album.singerId)
                            serialized_album = {
                                "id": str(album._id),
                                "title": album.title,
                                "singer": {
                                    "id": str(singer.id),
                                    "fullName": singer.fullName
                                }
                            }
                        except SingerModel.DoesNotExist:
                            serialized_album = {
                                "id": str(album._id),
                                "title": album.title,
                                "singer": None
                            }
                        serialized_albums.append(serialized_album)
                else:
                    serialized_albums = []
                
                # Serialize the song
                serialized_song = {
                    "_id": str(song._id),
                    "title": song.title,
                    "singers": [{"singerId": singer.singerId, "singerName": singer.singerName} for singer in song.singers],
                    "topics": [{"topicId": topic.topicId, "topicName": topic.topicName} for topic in song.topics],
                    "like": song.like,
                    "lyrics": [{"lyricContent": lyric.lyricContent, "lyricStartTime": lyric.lyricStartTime, "lyricEndTime": lyric.lyricEndTime} for lyric in song.lyrics],
                    "status": song.status,
                    "avatar": song.avatar,
                    "audio": song.audio,
                    "video": song.video,
                    "description": song.description,
                    "isPremiumOnly": song.isPremiumOnly,
                    "play_count": song.play_count,
                    "slug": song.slug,
                    "albums": serialized_albums,  # Changed from 'album' to 'albums'
                    "createdAt": song.createdAt,
                    "updatedAt": song.updatedAt
                }
                serialized_songs.append(serialized_song)
            
            return JsonResponse({
                "data": serialized_songs,
                "status": 200,
                "message": "Lấy bài hát thành công!"
            }, status=200)
        
        except TopicModel.DoesNotExist:
            return JsonResponse({
                "message": "Topic không tồn tại",
                "status": 404
            }, status=404)
        
        except Exception as e:
            return JsonResponse({
                "message": f"Lỗi: {str(e)}",
                "status": 500
            }, status=500)
    return JsonResponse({"message": "Phương thức yêu cầu không hợp lệ!"}, status=405) 

@csrf_exempt
async def get_song_by_slug(request, song_slug):
    if request.method == "GET":
        try:
            song = await sync_to_async(Song.objects.get)(slug=song_slug)
            # Get all albums for this song
            albums = await sync_to_async(list)(Album.objects.filter(songs__in=[song._id]))
            
            if albums:
                serialized_albums = []
                for album in albums:
                    try:
                        singer = await sync_to_async(SingerModel.objects.get)(id=album.singerId)
                        serialized_album = {
                            "id": str(album._id),
                            "title": album.title,
                            "singer": {
                                "id": str(singer.id),
                                "fullName": singer.fullName
                            }
                        }
                    except SingerModel.DoesNotExist:
                        serialized_album = {
                            "id": str(album._id),
                            "title": album.title,
                            "singer": None
                        }
                    serialized_albums.append(serialized_album)
            else:
                serialized_albums = []

            song_serialized = {
                "id": song._id,
                "title": song.title,
                "singers": [{"singerId": singer.singerId, "singerName": singer.singerName} for singer in song.singers],
                "topics": [{"topicId": topic.topicId, "topicName": topic.topicName} for topic in song.topics],
                "like": song.like,
                "lyrics": [{"lyricContent": lyric.lyricContent, "lyricStartTime": lyric.lyricStartTime, "lyricEndTime": lyric.lyricEndTime} for lyric in song.lyrics],
                "status": song.status,
                "avatar": song.avatar,
                "audio": song.audio,
                "video": song.video,
                "description": song.description,
                "isPremiumOnly": song.isPremiumOnly,
                "play_count": song.play_count,
                "slug": song.slug,
                "albums": serialized_albums,
                "createdAt": song.createdAt,
                "updatedAt": song.updatedAt
            }
            return JsonResponse({"data": song_serialized, "status": 200, "message": "Lấy bài hát thành công!"}, status=200)
        except Song.DoesNotExist:
            return JsonResponse({"message": "Bài hát không tồn tại!", "status": 404}, status=404)
        except Exception as e:
            return JsonResponse({"message": str(e)}, status=400)
    return JsonResponse({"message": "Phương thức yêu cầu không hợp lệ!", "status": 405}, status=405)

@csrf_exempt
async def like_song(request, song_slug):
    if request.method == "POST":
        try:
            # Get userId from request body
            try:
                data = json.loads(request.body)
                user_id = data.get('userId')
            except json.JSONDecodeError:
                # If it's not JSON, try to get it directly from the body
                user_id = request.body.decode('utf-8')
            
            if not user_id:
                return JsonResponse({"message": "User ID is required", "status": 400}, status=400)

            # Get the song
            try:
                song = await sync_to_async(Song.objects.get)(slug=song_slug)
            except Song.DoesNotExist:
                return JsonResponse({"message": "Song not found", "status": 404}, status=404)

            try:
                favorite_song = await sync_to_async(FavoriteSong.objects.get)(userId=user_id)
            except FavoriteSong.DoesNotExist:
                # Create a new FavoriteSong with ObjectId
                favorite_song = FavoriteSong(
                    userId=user_id,
                    songId=[]
                )
                await sync_to_async(favorite_song.save)()

            message = ""
            if song._id in favorite_song.songId:
                favorite_song.songId.remove(song._id)
                song.like = str(int(song.like) - 1)
                message = "Bạn đã bỏ thích bài hát này!"
            else:
                favorite_song.songId.append(song._id)
                song.like = str(int(song.like) + 1)
                message = "Bạn đã thích bài hát này!"
            
            favorite_song.updatedAt = datetime.now(UTC)
            song.updatedAt = datetime.now(UTC)

            await sync_to_async(favorite_song.save)()
            await sync_to_async(song.save)()

            return JsonResponse({"message": message, "status": 200}, status=200)
        
        except Exception as e:
            logger.error(traceback.format_exc())
            return JsonResponse({"message": str(e), "status": 400}, status=400)
    return JsonResponse({"message": "Phương thức yêu cầu không hợp lệ!", "status": 405}, status=405)

@csrf_exempt
async def increment_play_count(request, song_id):
    if request.method == "POST":
        try:
            song = await sync_to_async(Song.objects.get)(_id=song_id)
            play_count = int(song.play_count)
            song.play_count = play_count + 1
            song.updatedAt = datetime.now(UTC)
            await sync_to_async(song.save)()
            return JsonResponse({"message": "Số lượt nghe tăng lên!", "status": 200}, status=200)
        except Exception as e:
            return JsonResponse({"message": str(e), "status": 400}, status=400)
    return JsonResponse({"message": "Phương thức yêu cầu không hợp lệ!", "status": 405}, status=405)

@csrf_exempt
async def filter_song(request):
    if request.method == "GET":
        try:
            # Try to get filters from query parameters first
            filter_object = {
                'status': request.GET.get('status', 'all'),
                'deleted': request.GET.get('isDeleted', 'all'),
                'isPremiumOnly': request.GET.get('isPremiumOnly', 'all'),
            }
            
            # Create a base query
            query = {}
            
            # Define default values for each filter type
            default_values = {
                'status': 'all',
                'deleted': 'all',
                'isPremiumOnly': 'all',
            }
            
            # Only add filters that are different from their default values
            for key, value in filter_object.items():
                if value != default_values[key]:
                    # Convert string values to appropriate types
                    if key == 'deleted':
                        query[key] = value.lower() == 'true'
                    else:
                        query[key] = value
            
            # Apply the filter
            songs = await sync_to_async(Song.objects.filter)(**query)
            songs = await sync_to_async(list)(songs)
            
            # Serialize the songs
            serialized_songs = [{
                "_id": str(song._id),
                "title": song.title,
                "singers": [{"singerId": singer.singerId, "singerName": singer.singerName} for singer in song.singers],
                "like": song.like,
                "status": song.status,
                "deleted": song.deleted,
                "createdAt": song.createdAt,
                "updatedAt": song.updatedAt,
                "slug": song.slug,
            } for song in songs]
            
            return JsonResponse({"data": serialized_songs, "status": 200, "message": "Lấy bài hát thành công!"}, status=200)
        except Exception as e:
            print("Error in filter_song:", str(e))  # Add error logging
            return JsonResponse({"message": str(e), "status": 400}, status=400)
    return JsonResponse({"message": "Phương thức yêu cầu không hợp lệ!", "status": 405}, status=405)

@csrf_exempt
async def search_song(request):
    if request.method == "GET":
        try:
            query = request.GET.get('keyword', '')

            search_query = Q(title__icontains=query) | Q(_id__icontains=query)
            
            # Apply the search query and other filters
            songs = await sync_to_async(Song.objects.filter)(search_query)
            songs = await sync_to_async(list)(songs)
            
            serialized_songs = [{
                "_id": str(song._id),
                "title": song.title,
                "singers": [{"singerId": singer.singerId, "singerName": singer.singerName} for singer in song.singers],
                "like": song.like,
                "status": song.status,
                "deleted": song.deleted,
                "createdAt": song.createdAt,
                "updatedAt": song.updatedAt,
                "slug": song.slug,
            } for song in songs]
            
            return JsonResponse({"data": serialized_songs, "status": 200, "message": "Lấy bài hát thành công!"}, status=200)
        except Exception as e:
            return JsonResponse({"message": str(e), "status": 400}, status=400)
    return JsonResponse({"message": "Phương thức yêu cầu không hợp lệ!", "status": 405}, status=405)

@csrf_exempt
async def get_all_songs_by_singer(request):
    if request.method == "GET":
        try:
            # Get singer IDs from query parameters as comma-separated string
            singer_ids_str = request.GET.get('singer_ids', '')
            
            if not singer_ids_str:
                return JsonResponse({"message": "Vui lòng cung cấp ít nhất một ca sĩ", "status": 400}, status=400)
            
            # Split the comma-separated string into a list
            singer_ids = [id.strip() for id in singer_ids_str.split(',') if id.strip()]
            
            if not singer_ids:
                return JsonResponse({"message": "Vui lòng cung cấp ít nhất một ca sĩ", "status": 400}, status=400)
            
            # Use MongoDB's $in operator to find songs by multiple singers
            songs = await sync_to_async(list)(Song.objects.filter(
                singers__singerId__in=singer_ids,
                deleted=False
            ))
            
            # Format the response
            serialized_songs = [{
                "_id": str(song._id),
                "title": song.title,
                "singers": [{"singerId": singer.singerId, "singerName": singer.singerName} for singer in song.singers],
                "like": song.like,
                "status": song.status,
                "deleted": song.deleted,
                "createdAt": song.createdAt,
                "updatedAt": song.updatedAt,
                "slug": song.slug,
                "avatar": song.avatar,
                "audio": song.audio,
                "isPremiumOnly": song.isPremiumOnly
            } for song in songs]
            
            return JsonResponse({
                "data": serialized_songs,
                "status": 200,
                "message": "Lấy bài hát thành công!"
            }, status=200)
        except Exception as e:
            logger.error("Error in get_all_songs_by_singer: %s", traceback.format_exc())
            return JsonResponse({"message": str(e), "status": 400}, status=400)
    return JsonResponse({"message": "Phương thức yêu cầu không hợp lệ!", "status": 405}, status=405)

@csrf_exempt
async def get_all_available_songs(request):
    if request.method == "GET":
        try:
            songs = await sync_to_async(list)(Song.objects.filter(deleted=False))
            serialized_songs = [{
                "_id": str(song._id),
                "title": song.title,
                "singers": [{"singerId": singer.singerId, "singerName": singer.singerName} for singer in song.singers],
                "like": song.like,
                "status": song.status,
                "slug": song.slug,
                "avatar": song.avatar,
                "audio": song.audio,
                "isPremiumOnly": song.isPremiumOnly
            } for song in songs]
            return JsonResponse({"data": serialized_songs, "status": 200, "message": "Lấy bài hát thành công!"}, status=200)
        except Exception as e:
            return JsonResponse({"message": str(e), "status": 400}, status=400)
    return JsonResponse({"message": "Phương thức yêu cầu không hợp lệ!", "status": 405}, status=405)

@csrf_exempt
async def filter_pending_songs(request):
    if request.method == "GET":
        try:
            # Try to get filters from query parameters first
            filter_object = {
                'status': request.GET.get('status', 'pending'),
                'isPremiumOnly': request.GET.get('isPremiumOnly', 'all'),
            }

            # Create a base query
            query = {}

            # Define default values for each filter type
            default_values = {
                'status': 'all',
                'isPremiumOnly': 'all',
            }

            # Only add filters that are different from their default values
            for key, value in filter_object.items():
                if value != default_values[key]:
                    if key == 'isPremiumOnly':
                        print(value)
                        query[key] = value.lower() == 'true'
                    else:
                        query[key] = value

            print(query)

            # Apply the filter
            songs = await sync_to_async(Song.objects.filter)(**query)
            songs = await sync_to_async(list)(songs)
            
            # Serialize the songs
            serialized_songs = [{
                "_id": str(song._id),
                "title": song.title,
                "singers": [{"singerId": singer.singerId, "singerName": singer.singerName} for singer in song.singers],
                "status": song.status,
                "deleted": song.deleted,
                "createdAt": song.createdAt,
                "updatedAt": song.updatedAt,
                "isPremiumOnly": song.isPremiumOnly,
                "createdBy": song.createdBy,
                "slug": song.slug,
            } for song in songs]

            return JsonResponse({"data": serialized_songs, "status": 200, "message": "Lấy bài hát thành công!"}, status=200)
        except Exception as e:
            return JsonResponse({"message": str(e), "status": 400}, status=400)
    return JsonResponse({"message": "Phương thức yêu cầu không hợp lệ!", "status": 405}, status=405)

@csrf_exempt
async def approve_multiple_songs(request):
    if request.method == "PATCH":
        try:
            data = json.loads(request.body)
            song_ids = data.get("songIds", [])
            approved_by = data.get("approvedBy", None)

            for song_id in song_ids:
                try:
                    print("Checking song_id: ", song_id)
                    song = await sync_to_async(Song.objects.get)(_id=song_id)
                    song.status = "approved"
                    song.approvedBy = approved_by
                    song.updatedAt = datetime.now(UTC)
                    await sync_to_async(song.save)()
                except Exception as e:
                    return JsonResponse({"message": str(e), "message": "Lỗi khi phê duyệt bài hát!", "status": 400}, status=400) 
            return JsonResponse({"message": "Bài hát đã được phê duyệt!", "status": 200}, status=200)

        except Exception as e:
            return JsonResponse({"message": str(e), "status": 400}, status=400)
    return JsonResponse({"message": "Phương thức yêu cầu không hợp lệ!", "status": 405}, status=405)

@csrf_exempt
async def reject_multiple_songs(request):
    if request.method == "PATCH":
        try:
            data = json.loads(request.body)
            song_ids = data.get("songIds", [])
            approved_by = data.get("approvedBy", None)

            for song_id in song_ids:
                try:
                    print("Checking song_id: ", song_id)
                    song = await sync_to_async(Song.objects.get)(_id=song_id)
                    song.status = "rejected"
                    song.approvedBy = approved_by
                    song.updatedAt = datetime.now(UTC)
                    await sync_to_async(song.save)()
                except Exception as e:
                    return JsonResponse({"error": str(e), "message": "Lỗi khi từ chối bài hát!", "status": 400}, status=400)
            return JsonResponse({"message": "Bài hát đã được từ chối!", "status": 200}, status=200)
        
        except Exception as e:
            return JsonResponse({"message": str(e), "status": 400}, status=400)
    return JsonResponse({"message": "Phương thức yêu cầu không hợp lệ!", "status": 405}, status=405)

@csrf_exempt
async def approve_song(request, song_id):
    if request.method == "PATCH":
        try:
            # Get userId from request body if it exists
            try:
                data = json.loads(request.body) if request.body else {}
                userId = data.get("userId")
            except json.JSONDecodeError:
                userId = None

            song = await sync_to_async(Song.objects.get)(_id=song_id)
            song.status = "approved"
            if userId:
                song.approvedBy = userId
            song.updatedAt = datetime.now(UTC)
            await sync_to_async(song.save)()
            return JsonResponse({"message": "Bài hát đã được phê duyệt!", "status": 200}, status=200)
        except Exception as e:
            return JsonResponse({"message": str(e), "status": 400}, status=400)
    return JsonResponse({"message": "Phương thức yêu cầu không hợp lệ!", "status": 405}, status=405)

@csrf_exempt
async def reject_song(request, song_id):
    if request.method == "PATCH":
        try:
            # Get userId from request body if it exists
            try:
                data = json.loads(request.body) if request.body else {}
                userId = data.get("userId")
            except json.JSONDecodeError:
                userId = None

            song = await sync_to_async(Song.objects.get)(_id=song_id)
            song.status = "rejected"
            if userId:
                song.approvedBy = userId
            song.updatedAt = datetime.now(UTC)
            await sync_to_async(song.save)()
            return JsonResponse({"message": "Bài hát đã được từ chối!", "status": 200}, status=200)
        except Exception as e:
            return JsonResponse({"message": str(e), "status": 400}, status=400)
    return JsonResponse({"message": "Phương thức yêu cầu không hợp lệ!", "status": 405}, status=405)

@csrf_exempt
async def check_song_is_liked_by_user(request):
    if request.method == "GET":
        try:
            # Get user ID and song ID from query parameters
            user_id = request.GET.get('id')
            song_id = request.GET.get('songId')

            if not user_id:
                return JsonResponse({"message": "User ID is required", "status": 400}, status=400)
            
            if not song_id:
                return JsonResponse({"message": "Song ID is required", "status": 400}, status=400)

            # Get favorite songs for the user
            try:
                favorite_songs = await sync_to_async(FavoriteSong.objects.get)(userId=user_id)
                # Check if the song exists in the user's favorites
                is_liked = song_id in favorite_songs.songId
                return JsonResponse({"isLiked": is_liked, "status": 200, "message": "Get data succesfully"}, status=200)
            except FavoriteSong.DoesNotExist:
                # If user has no favorites, the song is not liked
                return JsonResponse({"isLiked": False, "status": 200, "message": "Get data succesfully"}, status=200)
        
        except Exception as e:
            logger.error("Error in check_song_is_liked_by_user: %s", traceback.format_exc())
            return JsonResponse({"message": f"Lỗi hệ thống: {str(e)}", "status": 500}, status=500)
    return JsonResponse({"message": "Phương thức yêu cầu không hợp lệ!", "status": 405}, status=405)

@csrf_exempt
async def get_song_top_play(request):
    if request.method == 'GET':
        try:
            # Lấy 10 bài hát có lượt nghe cao nhất, không bị xóa
            top_songs = await sync_to_async(lambda: list(Song.objects(deleted=False).order_by('-play_count')[:10]))()

            result = []
            for song in top_songs:
                # Lấy danh sách album chứa bài hát này
                albums = await sync_to_async(lambda: list(Album.objects.filter(songs__in=[song._id])))()

                serialized_albums = []
                for album in albums:
                    try:
                        singer = await sync_to_async(SingerModel.objects.get)(id=album.singerId)
                        serialized_album = {
                            "id": str(album._id),
                            "title": album.title,
                            "singer": {
                                "id": str(singer.id),
                                "fullName": singer.fullName
                            }
                        }
                    except SingerModel.DoesNotExist:
                        serialized_album = {
                            "id": str(album._id),
                            "title": album.title,
                            "singer": None
                        }
                    serialized_albums.append(serialized_album)

                result.append({
                    "_id": song._id,
                    "title": song.title,
                    "avatar": song.avatar,
                    "play_count": song.play_count,
                    "singers": [{"singerId": s.singerId, "singerName": s.singerName} for s in song.singers],
                    "isPremiumOnly": song.isPremiumOnly,
                    "slug": song.slug,
                    "albums": serialized_albums,  
                    "audio": song.audio,
                })

            return JsonResponse({"status": "success", "data": result}, status=200)

        except Exception as e:
            return JsonResponse({
                "status": "error",
                "message": f"Lỗi hệ thống: {str(e)}",
                "traceback": traceback.format_exc()
            }, status=500)

    return JsonResponse({"status": "error", "message": "Invalid HTTP method"}, status=405)

@csrf_exempt
async def update_song_like_view(request):
    if request.method != 'POST':
        return JsonResponse({"status": "error", "message": "Chỉ hỗ trợ phương thức POST"}, status=405)

    try:
        body = json.loads(request.body.decode("utf-8"))
        song_id = body.get("songId")
        is_like = body.get("isLike")

        if song_id is None or is_like is None:
            return JsonResponse({
                "status": "error",
                "message": "Thiếu songId hoặc isLike"
            }, status=400)

        # Hàm đồng bộ để tương tác với MongoEngine
        def update_like_sync():
            try:
                song = Song.objects.filter(_id=song_id, deleted=False).first()
                if not song:
                    return {"success": False, "error": "Không tìm thấy bài hát."}

                if is_like:
                    song.like += 1
                else:
                    song.like = max(0, song.like - 1)

                song.updatedAt = datetime.now(timezone.utc)
                song.save()

                return {"success": True, "like": song.like}
            except Exception as e:
                return {"success": False, "error": str(e)}

        # Gọi hàm đồng bộ bằng sync_to_async
        result = await sync_to_async(update_like_sync)()

        if result["success"]:
            return JsonResponse({
                "status": "success",
                "message": "Đã cập nhật lượt like.",
                "like": result["like"]
            }, status=200)
        else:
            return JsonResponse({
                "status": "error",
                "message": result["error"]
            }, status=404 if "tìm thấy" in result["error"] else 500)

    except json.JSONDecodeError:
        return JsonResponse({"status": "error", "message": "Dữ liệu JSON không hợp lệ."}, status=400)
    except Exception as e:
        return JsonResponse({
            "status": "error",
            "message": f"Lỗi hệ thống: {str(e)}",
            "traceback": traceback.format_exc()
        }, status=500)
