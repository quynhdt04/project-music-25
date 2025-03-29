from datetime import datetime
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
import logging
import traceback
logger = logging.getLogger(__name__)

@csrf_exempt
async def list_all_song(request):
    if request.method == "GET":
        try:
            songs = await sync_to_async(Song.objects.all)()
            songs = await sync_to_async(list)(songs)

            # Serialize the songs into JSON-compatible data
            serialized_songs = [
                {
                    "_id": str(song._id),
                    "title": song.title,
                    "singers": [
            {"singerId": singer.singerId, "singerName": singer.singerName} for singer in song.singers
        ],  # Serialize each Singer object
                    "like": song.like,
                    "status": song.status,
                    "deleted": song.deleted,
                    "createdAt": song.createdAt,
                    "updatedAt": song.updatedAt,
                    "slug": song.slug,
                }
                for song in songs
            ]

            return JsonResponse({"data": serialized_songs}, status=200)
        
        except Exception as e:
            logger.error("Error in list_all_song: %s", traceback.format_exc())
            return JsonResponse({"error": f"Lỗi hệ thống: {str(e)}"}, status=500)
    return JsonResponse({"error": "Chức năng đang được phát triển"}, status=501)

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
            image_url = upload_file_to_cloudinary(image_file, "Spotify/images", "image")
        
        if audio_file:
            audio_url = upload_file_to_cloudinary(audio_file, "Spotify/audios", "video")
        
        if video_file:
            video_url = upload_file_to_cloudinary(video_file, "Spotify/videos", "video")
        
        
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

def upload_file_to_cloudinary(file, folder, type):
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
            status = request.POST.get("status", "active")
            deleted = request.POST.get("deleted", "false").lower() == "true"
            deletedAt = request.POST.get("deletedAt", None)

            # Validate required fields
            if not title:
                return JsonResponse({"error": "Tiêu đề không được để trống!"}, status=400)
            if not audio_url:
                return JsonResponse({"error": "Bài hát phải có file audio!"}, status=400)
            if not singers:
                return JsonResponse({"error": "Bài hát phải thuộc ít nhất 1 ca sĩ!"}, status=400)
            if not lyrics:
                return JsonResponse({"error": "Bài hát phải có lời!"}, status=400)

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
                slug=slugify(title),
            )
            await sync_to_async(new_song.save)()

            return JsonResponse({"message": "Tạo bài hát thành công!", "id": str(new_song._id)}, status=201)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Dữ liệu không hợp lệ!"}, status=400)
        except Exception as e:
            logger.error("Error in create_new_song: %s", traceback.format_exc())
            return JsonResponse({"error": f"Lỗi hệ thống: {str(e)}"}, status=500)
    return JsonResponse({"error": "Chức năng đang được phát triển"}, status=501)
    
@csrf_exempt
async def get_song_by_id(request, song_id):
    if request.method == "GET":
        try:
            song = await sync_to_async(Song.objects.get)(_id=song_id)

            serialized_song = {
                "_id": str(song._id),
                "title": song.title,
                "avatar": song.avatar,
                "audio": song.audio,
                "video": song.video,
                "description": song.description,
                "singers": [
                    {"singerId": singer.singerId, "singerName": singer.singerName} for singer in song.singers
                ],
                "topics": [
                    {"topicId": topic.topicId, "topicName": topic.topicName} for topic in song.topics
                ],
                "like": song.like,
                "lyrics": [
                    {
                        "lyricContent": lyric.lyricContent,
                        "lyricStartTime": lyric.lyricStartTime,
                        "lyricEndTime": lyric.lyricEndTime,
                    }
                    for lyric in song.lyrics
                ],
                "status": song.status,
                "deleted": song.deleted,
                "isPremiumOnly": song.isPremiumOnly,
                "createdBy": song.createdBy,
                "approvedBy": song.approvedBy,
                "slug": song.slug,
                "createdAt": song.createdAt.isoformat() if song.createdAt else None,
                "updatedAt": song.updatedAt.isoformat() if song.updatedAt else None,
            }

            return JsonResponse({"data": serialized_song}, status=200)
        
        except Song.DoesNotExist:
            return JsonResponse({"error": "Không tìm thấy bài hát!"}, status=404)
        except Exception as e:
            logger.error("Error in get_song_by_id: %s", traceback.format_exc())
            return JsonResponse({"error": f"Lỗi hệ thống: {str(e)}"}, status=500)
    return JsonResponse({"error": "Chức năng đang được phát triển"}, status=501)

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

            print("Check data", data)
            print("Check files", files)

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
                    print("Check song.video", song.video)
                    old_video_public_id = song.video.split("/")[-1].split(".")[0]
                    print("Check old_video_public_id", old_video_public_id)
                    resultMsg = destroy(f"Spotify/videos/{old_video_public_id}", resource_type="video")
                    print("Check resultMsg", resultMsg)

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

            await sync_to_async(song.save)()
            return JsonResponse({"message": "Cập nhật bài hát thành công!", "id": song_id}, status=200)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Dữ liệu không hợp lệ!"}, status=400)
        except Exception as e:
            logger.error("Error in update_song_data: %s", traceback.format_exc())
            return JsonResponse({"error": f"Lỗi hệ thống: {str(e)}"}, status=500)
    return JsonResponse({"error": "Chức năng đang được phát triển"}, status=501)

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

            return JsonResponse({"data": serialized_song}, status=200)
        
        except Song.DoesNotExist:
            return JsonResponse({"error": "Không tìm thấy bài hát nào!"}, status=404)
        except Exception as e:
            logger.error("Error in get_latest_song: %s", traceback.format_exc())
            return JsonResponse({"error": f"Lỗi hệ thống: {str(e)}"}, status=500)
    return JsonResponse({"error": "Chức năng đang được phát triển"}, status=501)

@csrf_exempt
async def delete_song_data(request, song_id):
    if request.method == "DELETE":
        try:
            # Check if the song exists
            song = await sync_to_async(Song.objects.get)(_id=song_id)

            # Perform a shallow delete
            song.deleted = True
            song.deletedAt = datetime.utcnow()  # Set the deletion timestamp
            await sync_to_async(song.save)()

            return JsonResponse({"message": "Xóa bài hát thành công!", "status": 200}, status=200)
        
        except Song.DoesNotExist:
            return JsonResponse({"error": "Không tìm thấy bài hát!"}, status=404)
        except Exception as e:
            logger.error("Error in delete_song_data: %s", traceback.format_exc())
            return JsonResponse({"error": f"Lỗi hệ thống: {str(e)}"}, status=500)
    return JsonResponse({"error": "Chức năng đang được phát triển"}, status=501)

@csrf_exempt
async def delete_multiple_songs(request):
    if request.method == "DELETE":
        try:
            data = json.loads(request.body)
            song_ids = data.get("songIds", [])

            # Delete each song by ID
            for song_id in song_ids:
                try:
                    song = await sync_to_async(Song.objects.get)(_id=song_id)
                    song.deleted = True
                    song.deletedAt = datetime.utcnow()  # Set the deletion timestamp
                    await sync_to_async(song.save)()
                except Song.DoesNotExist:
                    logger.warning(f"Song with ID {song_id} not found. Skipping.")

            return JsonResponse({"message": "Xóa bài hát thành công!"}, status=200)
        
        except Song.DoesNotExist:
            return JsonResponse({"error": "Không tìm thấy bài hát!"}, status=404)
        except Exception as e:
            logger.error("Error in delete_multiple_songs: %s", traceback.format_exc())
            return JsonResponse({"error": f"Lỗi hệ thống: {str(e)}"}, status=500)
    return JsonResponse({"error": "Chức năng đang được phát triển"}, status=501)

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
                    await sync_to_async(song.save)()
                except Song.DoesNotExist:
                    logger.warning(f"Song with ID {song_id} not found. Skipping.")

            return JsonResponse({"message": "Khôi phục bài hát thành công!", "status": 200}, status=200)
        
        except Song.DoesNotExist:
            return JsonResponse({"error": "Không tìm thấy bài hát!"}, status=404)
        except Exception as e:
            logger.error("Error in restore_multiple_songs: %s", traceback.format_exc())
            return JsonResponse({"error": f"Lỗi hệ thống: {str(e)}"}, status=500)
    return JsonResponse({"error": "Chức năng đang được phát triển"}, status=501)

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

            return JsonResponse({"data": serialized_songs}, status=200)
        
        except Exception as e:
            logger.error("Error in get_all_pending_song: %s", traceback.format_exc())
            return JsonResponse({"error": f"Lỗi hệ thống: {str(e)}"}, status=500)
    return JsonResponse({"error": "Chức năng đang được phát triển"}, status=501)