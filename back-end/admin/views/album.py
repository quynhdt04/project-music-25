from datetime import datetime, UTC
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
from models.album import Album
import logging
import traceback
from bson import ObjectId
from models.song import Song
from models.singer import Singer
logger = logging.getLogger(__name__)
from mongoengine.queryset.visitor import Q

def generate_public_id(file):
    # Generate a hash of the file content
    file_hash = hashlib.md5(file.read()).hexdigest()
    file.seek(0)  # Reset file pointer after reading
    return f"{file_hash}"

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

        return result["secure_url"]  # Return just the URL
    except Exception as e:
        # Log the error for debugging
        logger.error("Error in upload_file_to_cloudinary: %s", traceback.format_exc())
        return None

def convert_objectid_to_str(obj):
    if isinstance(obj, ObjectId):
        return str(obj)
    elif isinstance(obj, dict):
        return {key: convert_objectid_to_str(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_objectid_to_str(item) for item in obj]
    return obj

@csrf_exempt
async def get_all_pending_albums(request):
    if request.method == "GET":
        try:
            # Perform the aggregation to join Album with Singer
            pipeline = [
                {
                    "$match": {"status": "pending"}  
                },
                {
                    "$lookup": {
                        "from": "songs",  
                        "localField": "songs",  
                        "foreignField": "_id",  
                        "as": "album_songs",
                        "pipeline": [
                            {
                                "$match": {
                                    "deleted": False
                                }
                            },
                            {
                                "$project": {
                                    "_id": 1,
                                    "title": 1,
                                    "isPremiumOnly": 1,
                                }
                            }
                        ]
                    }
                },
                {
                    "$lookup": {
                        "from": "singers",  
                        "let": {"singerId": "$singerId"},
                        "pipeline": [
                            {
                                "$match": {
                                    "$expr": {
                                        "$eq": [
                                            {"$toString": "$_id"},
                                            "$$singerId"
                                        ]
                                    }
                                }
                            },
                            {
                                "$project": {
                                    "_id": 1,
                                    "fullName": 1,
                                }
                            }
                        ],
                        "as": "singer"  
                    }
                },
                {
                    "$unwind": {
                        "path": "$singer",
                        "preserveNullAndEmptyArrays": True
                    }
                },
                {
                    "$project": {
                        "singerId": 0,
                        "songs": 0,
                    }
                }
            ]

            # Execute the aggregation pipeline
            albums = await sync_to_async(list)(Album.objects.aggregate(*pipeline))
            
            # Convert all ObjectId fields to strings
            albums = convert_objectid_to_str(albums)

            return JsonResponse({"data": albums, "message": "Get data successfully", "status": 200}, status=200)
        except Exception as e:
            logger.error(traceback.format_exc())
            return JsonResponse({"error": str(e), "status": 500}, status=500)
    return JsonResponse({"message": "Chức năng đang được phát triển", "status": 501}, status=501)

@csrf_exempt
async def get_all_albums(request):
    if request.method == "GET":
        try:
            # Create aggregation pipeline to join with singers and accounts
            pipeline = [
                {
                    "$lookup": {
                        "from": "singers",
                        "let": {"singerId": "$singerId"},
                        "pipeline": [
                            {
                                "$match": {
                                    "$expr": {
                                        "$eq": [
                                            {"$toString": "$_id"},
                                            "$$singerId"
                                        ]
                                    }
                                }
                            },
                            {
                                "$project": {
                                    "_id": 1,
                                    "fullName": 1,
                                    "avatar": 1
                                }
                            }
                        ],
                        "as": "singer"
                    }
                },
                {
                    "$lookup": {
                        "from": "accounts",
                        "let": {"createdBy": "$createdBy"},
                        "pipeline": [
                            {
                                "$match": {
                                    "$expr": {
                                        "$eq": [
                                            {"$toString": "$_id"},
                                            "$$createdBy"
                                        ]
                                    }
                                }
                            },
                            {
                                # $lookup = include
                                "$lookup": {
                                    "from": "roles",
                                    "let": {"roleId": "$role_id"},
                                    "pipeline": [
                                        {
                                            "$match": {
                                                "$expr": {
                                                    "$eq": [
                                                        {"$toString": "$_id"},
                                                        "$$roleId"
                                                    ]
                                                }
                                            }
                                        },
                                        {
                                            # $project = attributes exclude
                                            "$project": {
                                                "_id": 1,
                                                "title": 1,
                                                "description": 1
                                            }
                                        }
                                    ],
                                    "as": "roleDetails"
                                }
                            },
                            {
                                # $unwind = JS destructuring
                                "$unwind": {
                                    "path": "$roleDetails",
                                    "preserveNullAndEmptyArrays": True
                                }
                            },
                            {
                                "$project": {
                                    "_id": 1,
                                    "fullName": 1,
                                    "email": 1,
                                    "role": {
                                        "_id": "$roleDetails._id",
                                        "name": "$roleDetails.title",
                                        "description": "$roleDetails.description"
                                    }
                                }
                            }
                        ],
                        "as": "creator"
                    }
                },
                {
                    "$unwind": {
                        "path": "$singer",
                        "preserveNullAndEmptyArrays": True
                    }
                },
                {
                    "$unwind": {
                        "path": "$creator",
                        "preserveNullAndEmptyArrays": True
                    }
                },
                {
                    "$project": {
                        "title": 1,
                        "cover_image": 1,
                        "songs": 1,
                        "status": 1,
                        "deleted": 1,
                        "createdAt": 1,
                        "updatedAt": 1,
                        "singer": {
                            "_id": "$singer._id",
                            "fullName": "$singer.fullName",
                            "avatar": "$singer.avatar"
                        },
                        "creator": {
                            "_id": "$creator._id",
                            "username": "$creator.fullName",
                            "email": "$creator.email",
                            "role": "$creator.role"
                        }
                    }
                }
            ]

            # Execute the aggregation pipeline
            albums = await sync_to_async(list)(Album.objects.aggregate(*pipeline))
            
            # Convert all ObjectId fields to strings
            albums = convert_objectid_to_str(albums)

            return JsonResponse({
                "data": albums,
                "status": 200,
                "message": "Lấy tất cả album thành công!"
            }, status=200)
        except Exception as e:
            logger.error(traceback.format_exc())
            return JsonResponse({
                "error": str(e),
                "status": 500,
                "message": "Lấy tất cả album thất bại!"
            }, status=500)
    return JsonResponse({
        "message": "Phương thức yêu cầu không hợp lệ!",
        "status": 405
    }, status=405)

@csrf_exempt
async def get_all_albums(request):
    if request.method == "GET":
        try:
            # Create aggregation pipeline to join with singers and accounts
            pipeline = [
                {
                    "$lookup": {
                        "from": "singers",
                        "let": {"singerId": "$singerId"},
                        "pipeline": [
                            {
                                "$match": {
                                    "$expr": {
                                        "$eq": [
                                            {"$toString": "$_id"},
                                            "$$singerId"
                                        ]
                                    }
                                }
                            },
                            {
                                "$project": {
                                    "_id": 1,
                                    "fullName": 1,
                                    "avatar": 1
                                }
                            }
                        ],
                        "as": "singer"
                    }
                },
                {
                    "$lookup": {
                        "from": "accounts",
                        "let": {"createdBy": "$createdBy"},
                        "pipeline": [
                            {
                                "$match": {
                                    "$expr": {
                                        "$eq": [
                                            {"$toString": "$_id"},
                                            "$$createdBy"
                                        ]
                                    }
                                }
                            },
                            {
                                # $lookup = include
                                "$lookup": {
                                    "from": "roles",
                                    "let": {"roleId": "$role_id"},
                                    "pipeline": [
                                        {
                                            "$match": {
                                                "$expr": {
                                                    "$eq": [
                                                        {"$toString": "$_id"},
                                                        "$$roleId"
                                                    ]
                                                }
                                            }
                                        },
                                        {
                                            # $project = attributes exclude
                                            "$project": {
                                                "_id": 1,
                                                "title": 1,
                                                "description": 1
                                            }
                                        }
                                    ],
                                    "as": "roleDetails"
                                }
                            },
                            {
                                # $unwind = JS destructuring
                                "$unwind": {
                                    "path": "$roleDetails",
                                    "preserveNullAndEmptyArrays": True
                                }
                            },
                            {
                                "$project": {
                                    "_id": 1,
                                    "fullName": 1,
                                    "email": 1,
                                    "role": {
                                        "_id": "$roleDetails._id",
                                        "name": "$roleDetails.title",
                                        "description": "$roleDetails.description"
                                    }
                                }
                            }
                        ],
                        "as": "creator"
                    }
                },
                {
                    "$unwind": {
                        "path": "$singer",
                        "preserveNullAndEmptyArrays": True
                    }
                },
                {
                    "$unwind": {
                        "path": "$creator",
                        "preserveNullAndEmptyArrays": True
                    }
                },
                {
                    "$project": {
                        "title": 1,
                        "cover_image": 1,
                        "songs": 1,
                        "status": 1,
                        "deleted": 1,
                        "createdAt": 1,
                        "updatedAt": 1,
                        "singer": {
                            "_id": "$singer._id",
                            "fullName": "$singer.fullName",
                            "avatar": "$singer.avatar"
                        },
                        "creator": {
                            "_id": "$creator._id",
                            "username": "$creator.fullName",
                            "email": "$creator.email",
                            "role": "$creator.role"
                        }
                    }
                }
            ]

            # Execute the aggregation pipeline
            albums = await sync_to_async(list)(Album.objects.aggregate(*pipeline))
            
            # Convert all ObjectId fields to strings
            albums = convert_objectid_to_str(albums)

            return JsonResponse({
                "data": albums,
                "status": 200,
                "message": "Lấy tất cả album thành công!"
            }, status=200)
        except Exception as e:
            logger.error(traceback.format_exc())
            return JsonResponse({
                "error": str(e),
                "status": 500,
                "message": "Lấy tất cả album thất bại!"
            }, status=500)
    return JsonResponse({
        "error": "Phương thức yêu cầu không hợp lệ!",
        "status": 405
    }, status=405)

@csrf_exempt
async def get_album_by_id(request, album_id):
    if request.method == "GET":
        try:
            # Perform the aggregation to join Album with Singer
            pipeline = [
                {
                    "$match": {
                        "_id": album_id,
                        "status": "pending"
                    }  
                },
                {
                    "$lookup": {
                        "from": "songs",  
                        "localField": "songs",  
                        "foreignField": "_id",  
                        "as": "album_songs",
                        "pipeline": [
                            {
                                "$match": {
                                    "deleted": False
                                }
                            },
                            {
                                "$project": {
                                    "_id": 1,
                                    "title": 1,
                                    "avatar": 1,
                                    "singers": 1,
                                    "audio": 1,
                                    "isPremiumOnly": 1,
                                }
                            }
                        ]
                    }
                },
                {
                    "$lookup": {
                        "from": "singers",  
                        "let": {"singerId": "$singerId"},
                        "pipeline": [
                            {
                                "$match": {
                                    "$expr": {
                                        "$eq": [
                                            {"$toString": "$_id"},
                                            "$$singerId"
                                        ]
                                    }
                                }
                            },
                            {
                                "$project": {
                                    "_id": 1,
                                    "fullName": 1,
                                }
                            }
                        ],
                        "as": "singer"  
                    }
                },
                {
                    "$unwind": {
                        "path": "$singer",
                        "preserveNullAndEmptyArrays": True
                    }
                },
                {
                    "$project": {
                        "singerId": 0,
                        "songs": 0,
                    }
                }
            ]

            # Execute the aggregation pipeline
            albums = await sync_to_async(list)(Album.objects.aggregate(*pipeline))
            
            if not albums:
                return JsonResponse({"message": "Không tìm thấy album", "status": 404}, status=404)
                
            # Convert all ObjectId fields to strings
            album = convert_objectid_to_str(albums[0])

            return JsonResponse({"data": album, "message": "Get data successfully", "status": 200}, status=200)
        except Exception as e:
            logger.error(traceback.format_exc())
            return JsonResponse({"error": str(e), "status": 500}, status=500)
    return JsonResponse({"message": "Chức năng đang được phát triển", "status": 501}, status=501)

@csrf_exempt
async def get_latest_album(request):
    if request.method == "GET":
        try:
            # Get the latest album using find_one with sort
            latest_album = await sync_to_async(Album.objects.order_by('-createdAt').first)()
            
            if not latest_album:
                return JsonResponse({"error": "Không tìm thấy album nào", "status": 404}, status=404)
            
            # Format the response
            formatted_album = {
                "_id": str(latest_album._id),
                "title": latest_album.title,
                "status": latest_album.status,
                "deleted": latest_album.deleted,
            }
            
            return JsonResponse({"data": formatted_album, "message": "Lấy album mới nhất thành công", "status": 200}, status=200)
        except Exception as e:
            logger.error(traceback.format_exc())
            return JsonResponse({"error": str(e), "message": "Lấy album mới nhất thất bại", "status": 500}, status=500)
    return JsonResponse({"error": "Chức năng đang được phát triển", "status": 501}, status=501)

@csrf_exempt
async def create_new_album(request):
    if request.method == "POST":
        try:
            # Parse multipart/form-data
            if request.content_type.startswith('multipart/form-data'):
                try:
                    parser = MultiPartParser(request.META, request, request.upload_handlers)
                    data, files = parser.parse()
                except MultiPartParserError as e:
                    return JsonResponse({"error": f"Failed to parse multipart data: {str(e)}", "status": 400}, status=400)
            else:
                data = QueryDict(request.body)
                files = {}

            # Get form data
            id = data.get("albumId")
            title = data.get("title")
            singerId = data.get("singerId")
            songs_str = data.get("songs")
            accountId = data.get("accountId")

            # Parse songs from JSON string to list
            try:
                songs = json.loads(songs_str) if isinstance(songs_str, str) else songs_str
                if not isinstance(songs, list):
                    return JsonResponse({"message": "Songs must be a list", "status": 400}, status=400)
            except json.JSONDecodeError:
                return JsonResponse({"message": "Invalid songs format", "status": 400}, status=400)

            # Validate required fields
            if not all([id, title, singerId, songs, accountId]):
                return JsonResponse({"message": "Vui lòng cung cấp đầy đủ thông tin", "status": 400}, status=400)

            # Handle avatar upload
            avatar_file = files.get("avatar")
            avatar_url = None
            if avatar_file:
                avatar_url = await upload_file_to_cloudinary(avatar_file, "Spotify/images", "image")
                if not avatar_url:
                    return JsonResponse({"message": "Lỗi khi tải lên ảnh đại diện", "status": 500}, status=500)

            # Create new album
            album = Album(
                _id=id,
                title=title,
                cover_image=avatar_url,
                singerId=singerId,
                songs=songs,
                status="pending",
                deleted=False,
                deletedAt=None,
                approvedBy=None,
                createdBy=accountId,
                slug=slugify(title)
            )
            await sync_to_async(album.save)()

            return JsonResponse({
                "message": "Tạo album thành công",
                "status": 200
            }, status=200)
        except Exception as e:
            logger.error(traceback.format_exc())
            return JsonResponse({"error": str(e), "status": 500}, status=500)
    return JsonResponse({"error": "Phương thức yêu cầu không hợp lệ!", "status": 405}, status=405)

@csrf_exempt
async def update_album(request, album_id):
    if request.method == "PUT":
        try:
            # Parse multipart/form-data
            if request.content_type.startswith('multipart/form-data'):
                try:
                    parser = MultiPartParser(request.META, request, request.upload_handlers)
                    data, files = parser.parse()
                except MultiPartParserError as e:
                    return JsonResponse({"message": f"Failed to parse multipart data: {str(e)}", "status": 400}, status=400)
            else:
                data = QueryDict(request.body)
                files = {}

            # Get form data
            id = data.get("albumId")
            title = data.get("title")
            singerId = data.get("singerId")
            songs_str = data.get("songs")
            accountId = data.get("accountId")

            # Parse songs from JSON string to list
            try:
                songs = json.loads(songs_str) if isinstance(songs_str, str) else songs_str
                if not isinstance(songs, list):
                    return JsonResponse({"message": "Songs must be a list", "status": 400}, status=400)
            except json.JSONDecodeError:
                return JsonResponse({"message": "Invalid songs format", "status": 400}, status=400)

            # Validate required fields
            if not all([id, title, singerId, songs, accountId]):
                return JsonResponse({"message": "Vui lòng cung cấp đầy đủ thông tin", "status": 400}, status=400)

            # Check if album exists
            try:
                album = await sync_to_async(Album.objects.get)(_id=album_id)
            except Album.DoesNotExist:
                return JsonResponse({"message": "Album không tồn tại!", "status": 404}, status=404)

            # Update title if provided
            if title is not None:
                if not title.strip():
                    return JsonResponse({"message": "Tiêu đề album không được để trống!", "status": 400}, status=400)
                album.title = title

            # Handle avatar update
            new_avatar_file = files.get("avatar")
            current_avatar_url = data.get("avatar")
            
            if new_avatar_file:
                # Delete old avatar if exists
                if album.cover_image:
                    try:
                        old_avatar_public_id = album.cover_image.split("/")[-1].split(".")[0]
                        destroy(f"Spotify/images/{old_avatar_public_id}")
                    except Exception as e:
                        logger.error(f"Error deleting old avatar: {str(e)}")
                
                # Upload new avatar
                try:
                    avatar_url = await upload_file_to_cloudinary(new_avatar_file, "Spotify/images", "image")
                    if avatar_url:
                        album.cover_image = avatar_url
                except Exception as e:
                    logger.error(f"Error uploading new avatar: {str(e)}")
                    return JsonResponse({"message": "Lỗi khi tải lên ảnh đại diện mới", "status": 500}, status=500)
            elif current_avatar_url:
                album.cover_image = current_avatar_url

            # Update other fields
            if singerId is not None:
                album.singerId = singerId
            if songs is not None:
                album.songs = songs
            else:
                return JsonResponse({"message": "Vui lòng cung cấp bài hát", "status": 400}, status=400)

            album.updatedAt = datetime.now(UTC)

            # Save changes
            await sync_to_async(album.save)()

            return JsonResponse({
                "message": "Cập nhật album thành công",
                "status": 200
            }, status=200)

        except json.JSONDecodeError as e:
            return JsonResponse({"message": str(e), "status": 400}, status=400)
        except Exception as e:
            logger.error(traceback.format_exc())
            return JsonResponse({"error": str(e), "message": "Cập nhật album thất bại", "status": 500}, status=500)
    return JsonResponse({"error": "Phương thức yêu cầu không hợp lệ!", "status": 405}, status=405)

@csrf_exempt
async def delete_album(request, album_id):
    if request.method == "PATCH":
        try:
            # Check if album exists
            try:
                album = await sync_to_async(Album.objects.get)(_id=album_id)
            except Album.DoesNotExist:
                return JsonResponse({"message": "Album không tồn tại!", "status": 404}, status=404)

            # Update deleted field
            album.deleted = True
            album.deletedAt = datetime.now(UTC)
            album.updatedAt = datetime.now(UTC)
            await sync_to_async(album.save)()

            return JsonResponse({"message": "Xóa album thành công", "status": 200}, status=200)
        except Exception as e:
            logger.error(traceback.format_exc())
            return JsonResponse({"error": str(e), "message": "Xóa album thất bại", "status": 500}, status=500)
    return JsonResponse({"message": "Phương thức yêu cầu không hợp lệ!", "status": 405}, status=405)

@csrf_exempt
async def delete_multiple_albums(request):
    if request.method == "PATCH":
        try:
            # Parse album_ids from request body
            data = json.loads(request.body)
            album_ids = data.get("albumIds", [])
            
            # Update deleted field for each album
            for album_id in album_ids:
                try:
                    album = await sync_to_async(Album.objects.get)(_id=album_id)
                    album.deleted = True
                    album.deletedAt = datetime.now(UTC)
                    album.updatedAt = datetime.now(UTC)
                    await sync_to_async(album.save)()
                except Exception as e:
                    logger.error(traceback.format_exc())
                    return JsonResponse({"error": str(e), "message": "Xóa album thất bại", "status": 500}, status=500)

            return JsonResponse({"message": "Xóa album thành công", "status": 200}, status=200)
        except Exception as e:
            logger.error(traceback.format_exc())
            return JsonResponse({"error": str(e), "message": "Xóa album thất bại", "status": 500}, status=500)
    return JsonResponse({"message": "Phương thức yêu cầu không hợp lệ!", "status": 405}, status=405)

@csrf_exempt
async def restore_multiple_albums(request):
    if request.method == "PATCH":
        try:
            # Parse album_ids from request body
            data = json.loads(request.body)
            album_ids = data.get("albumIds", [])
            
            # Update deleted field for each album
            for album_id in album_ids:
                try:
                    album = await sync_to_async(Album.objects.get)(_id=album_id)
                    album.deleted = False
                    album.deletedAt = None
                    album.updatedAt = datetime.now(UTC)
                    await sync_to_async(album.save)()
                except Exception as e:
                    logger.error(traceback.format_exc())
                    return JsonResponse({"message": str(e), "message": "Khôi phục album thất bại", "status": 500}, status=500)

            return JsonResponse({"message": "Khôi phục album thành công", "status": 200}, status=200)
        except json.JSONDecodeError:
            return JsonResponse({"message": "Dữ liệu không hợp lệ!", "status": 400}, status=400)
        except Exception as e:
            logger.error(traceback.format_exc())
            return JsonResponse({"error": str(e), "message": "Khôi phục album thất bại", "status": 500}, status=500)
    return JsonResponse({"message": "Phương thức yêu cầu không hợp lệ!", "status": 405}, status=405)

@csrf_exempt
async def search_album(request):
    if request.method == "GET":
        try:
            query = request.GET.get('keyword', '')

            # Create aggregation pipeline
            pipeline = [
                {
                    "$lookup": {
                        "from": "singers",
                        "let": {"singerId": "$singerId"},
                        "pipeline": [
                            {
                                "$match": {
                                    "$expr": {
                                        "$eq": [
                                            {"$toString": "$_id"},
                                            "$$singerId"
                                        ]
                                    }
                                }
                            },
                            {
                                "$project": {
                                    "_id": 1,
                                    "fullName": 1,
                                    "avatar": 1
                                }
                            }
                        ],
                        "as": "singer"
                    }
                },
                {
                    "$unwind": {
                        "path": "$singer",
                        "preserveNullAndEmptyArrays": True
                    }
                },
                {
                    "$lookup": {
                        "from": "songs",
                        "localField": "songs",
                        "foreignField": "_id",
                        "as": "album_songs",
                        "pipeline": [
                            {
                                "$match": {
                                    "deleted": False
                                }
                            },
                            {
                                "$project": {
                                    "_id": 1,
                                    "title": 1,
                                    "avatar": 1,
                                    "audio": 1,
                                    "isPremiumOnly": 1
                                }
                            }
                        ]
                    }
                },
                {
                    "$lookup": {
                        "from": "accounts",
                        "let": {"createdBy": "$createdBy"},
                        "pipeline": [
                            {
                                "$match": {
                                    "$expr": {
                                        "$eq": [
                                            {"$toString": "$_id"},
                                            "$$createdBy"
                                        ]
                                    }
                                }
                            },
                            {
                                "$project": {
                                    "_id": 1,
                                    "fullName": 1,
                                    "email": 1,
                                }
                            }
                        ],
                        "as": "creator"
                    }
                },
                {
                    "$unwind": {
                        "path": "$creator",
                        "preserveNullAndEmptyArrays": True
                    }
                },
                {
                    "$match": {
                        "$or": [
                            {"title": {"$regex": query, "$options": "i"}},
                            {"_id": {"$regex": query, "$options": "i"}},
                            {"singer.fullName": {"$regex": query, "$options": "i"}}
                        ]
                    }
                },
                {
                    "$project": {
                        "_id": 1,
                        "title": 1,
                        "status": 1,
                        "deleted": 1,
                        "updatedAt": 1,
                        "slug": 1,
                        "singer": {
                            "_id": "$singer._id",
                            "fullName": "$singer.fullName",
                            "avatar": "$singer.avatar"
                        },
                        "songs": "$album_songs",
                        "creator": {
                            "_id": "$creator._id",
                            "username": "$creator.fullName",
                            "email": "$creator.email",
                        }
                    }
                }
            ]

            # Execute the aggregation pipeline
            albums = await sync_to_async(list)(Album.objects.aggregate(*pipeline))
            
            # Convert ObjectId to string
            albums = convert_objectid_to_str(albums)

            return JsonResponse({
                "data": albums,
                "status": 200,
                "message": "Lấy album thành công!"
            }, status=200)
        except Exception as e:
            logger.error(traceback.format_exc())
            return JsonResponse({"message": str(e), "status": 400}, status=400)
    return JsonResponse({"message": "Phương thức yêu cầu không hợp lệ!", "status": 405}, status=405)

@csrf_exempt
async def filter_album(request):
    if request.method == "GET":
        try:
            # Try to get filters from query parameters first
            filter_object = {
                'status': request.GET.get('status', 'all'),
                'deleted': request.GET.get('isDeleted', 'all'),
            }
            
            # Create a base query
            query = {}
            
            # Define default values for each filter type
            default_values = {
                'status': 'all',
                'deleted': 'all',
            }
            
            # Only add filters that are different from their default values
            for key, value in filter_object.items():
                if value != default_values[key]:
                    # Convert string values to appropriate types
                    if key == 'deleted':
                        query[key] = value.lower() == 'true'
                    else:
                        query[key] = value
        
            # Create aggregation pipeline
            pipeline = [
                {
                    "$match": query
                },
                {
                    "$lookup": {
                        "from": "singers",
                        "let": {"singerId": "$singerId"},
                        "pipeline": [
                            {
                                "$match": {
                                    "$expr": {
                                        "$eq": [
                                            {"$toString": "$_id"},
                                            "$$singerId"
                                        ]
                                    }
                                }
                            },
                            {
                                "$project": {
                                    "_id": 1,
                                    "fullName": 1,
                                    "avatar": 1
                                }
                            }
                        ],
                        "as": "singer"
                    }
                },
                {
                    "$unwind": {
                        "path": "$singer",
                        "preserveNullAndEmptyArrays": True
                    }
                },
                {
                    "$lookup": {
                        "from": "songs",
                        "localField": "songs",
                        "foreignField": "_id",
                        "as": "album_songs",
                        "pipeline": [
                            {
                                "$match": {
                                    "deleted": False
                                }
                            },
                            {
                                "$project": {
                                    "_id": 1,
                                    "title": 1,
                                    "avatar": 1,
                                    "audio": 1,
                                    "isPremiumOnly": 1
                                }
                            }
                        ]
                    }
                },
                {
                    "$lookup": {
                        "from": "accounts",
                        "let": {"createdBy": "$createdBy"},
                        "pipeline": [
                            {
                                "$match": {
                                    "$expr": {
                                        "$eq": [
                                            {"$toString": "$_id"},
                                            "$$createdBy"
                                        ]
                                    }
                                }
                            },
                            {
                                "$project": {
                                    "_id": 1,
                                    "fullName": 1,
                                    "email": 1
                                }
                            }
                        ],
                        "as": "creator"
                    }
                },
                {
                    "$unwind": {
                        "path": "$creator",
                        "preserveNullAndEmptyArrays": True
                    }
                },
                {
                    "$project": {
                        "_id": 1,
                        "title": 1,
                        "status": 1,
                        "deleted": 1,
                        "updatedAt": 1,
                        "slug": 1,
                        "singer": {
                            "_id": "$singer._id",
                            "fullName": "$singer.fullName",
                            "avatar": "$singer.avatar"
                        },
                        "songs": "$album_songs",
                        "creator": {
                            "_id": "$creator._id",
                            "username": "$creator.fullName",
                            "email": "$creator.email"
                        }
                    }
                }
            ]

            # Execute the aggregation pipeline
            albums = await sync_to_async(list)(Album.objects.aggregate(*pipeline))
            
            # Convert ObjectId to string
            albums = convert_objectid_to_str(albums)

            return JsonResponse({
                "data": albums,
                "status": 200,
                "message": "Lấy album thành công!"
            }, status=200)
        except Exception as e:
            logger.error(traceback.format_exc())
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Chức năng đang được phát triển"}, status=501)