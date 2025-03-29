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
from models.album import Album
import logging
import traceback
from bson import ObjectId
logger = logging.getLogger(__name__)

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

            return JsonResponse({"data": albums}, status=200)
        except Exception as e:
            logger.error(traceback.format_exc())
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Chức năng đang được phát triển"}, status=501)

@csrf_exempt
async def get_album_by_id(request, album_id):
    if request.method == "GET":
        try:
            # Perform the aggregation to join Album with Singer
            pipeline = [
                {
                    "$match": {
                        "_id": ObjectId(album_id),
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
                                "$project": {
                                    "_id": 1,
                                    "title": 1,
                                    "avatar": 1,
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
                return JsonResponse({"error": "Không tìm thấy album"}, status=404)
                
            # Convert all ObjectId fields to strings
            album = convert_objectid_to_str(albums[0])

            return JsonResponse({"data": album}, status=200)
        except Exception as e:
            logger.error(traceback.format_exc())
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Chức năng đang được phát triển"}, status=501)