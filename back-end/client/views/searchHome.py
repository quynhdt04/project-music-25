from rapidfuzz import fuzz
from models.song import Song
from models.album import Album
from models.singer import Singer as SingerModel
from models.singer import Singer
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from unidecode import unidecode
from asgiref.sync import sync_to_async
import asyncio

@csrf_exempt
async def search_songs(request):
    if request.method != 'GET':
        return JsonResponse({'message': 'Invalid request method'}, status=405)

    keyword = request.GET.get('keyword', '').lower()
    if not keyword:
        return JsonResponse({'message': 'Missing keyword'}, status=400)

    keyword_no_diacritics = unidecode(keyword)
    all_songs = await sync_to_async(list)(Song.objects(deleted=False))
    result_songs = []

    def is_similar(text):
        text = text.lower()
        text_no_diacritics = unidecode(text)
        if keyword in text or keyword_no_diacritics in text_no_diacritics:
            return True
        for word in text_no_diacritics.split():
            if fuzz.partial_ratio(keyword_no_diacritics, word) > 70:
                return True
        for char in keyword_no_diacritics:
            if char in text_no_diacritics:
                return True
        return False

    for song in all_songs:
        if len(result_songs) >= 4:
            break
        if is_similar(song.title):
            result_songs.append(song)

    if len(result_songs) < 4:
        existing_ids = [s._id for s in result_songs]
        for song in all_songs:
            if song._id in existing_ids:
                continue
            for singer in song.singers:
                if is_similar(singer.singerName):
                    result_songs.append(song)
                    break
            if len(result_songs) >= 4:
                break

    async def serialize_song(song):
        albums = await sync_to_async(list)(Album.objects.filter(songs__in=[song._id]))

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

        return {
            "id": song._id,
            "title": song.title,
            "singers": [{"singerId": s.singerId, "singerName": s.singerName} for s in song.singers],
            "topics": [{"topicId": t.topicId, "topicName": t.topicName} for t in song.topics],
            "like": song.like,
            "lyrics": [{"lyricContent": l.lyricContent, "lyricStartTime": l.lyricStartTime, "lyricEndTime": l.lyricEndTime} for l in song.lyrics],
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

    data = await sync_to_async(list)(await asyncio.gather(*(serialize_song(song) for song in result_songs)))

    return JsonResponse({'data': data, 'status': 200, 'message': 'Tìm kiếm thành công!'}, status=200)


@csrf_exempt
async def search_albums(request):
    if request.method != 'GET':
        return JsonResponse({'message': 'Invalid request method'}, status=405)

    keyword = request.GET.get('keyword', '').lower()
    if not keyword:
        return JsonResponse({'message': 'Missing keyword'}, status=400)

    keyword_no_diacritics = unidecode(keyword)
    all_albums = await sync_to_async(list)(Album.objects(deleted=False))
    result_albums = []

    def is_similar(text):
        text = text.lower()
        text_no_diacritics = unidecode(text)
        if keyword in text or keyword_no_diacritics in text_no_diacritics:
            return True
        for word in text_no_diacritics.split():
            if fuzz.partial_ratio(keyword_no_diacritics, word) > 70:
                return True
        for char in keyword_no_diacritics:
            if char in text_no_diacritics:
                return True
        return False

    for album in all_albums:
        if len(result_albums) >= 6:
            break
        if is_similar(album.title):
            result_albums.append(album)

    async def serialize_album(album):
        try:
            singer = await sync_to_async(SingerModel.objects.get)(id=album.singerId)
            singer_data = {
                "id": str(singer.id),
                "fullName": singer.fullName
            }
        except SingerModel.DoesNotExist:
            singer_data = None

        return {
            "id": str(album._id),
            "title": album.title,
            "cover_image": album.cover_image,
            "singer": singer_data,
            "songs": album.songs,
            "status": album.status,
            "slug": album.slug,
            "createdAt": album.createdAt,
            "updatedAt": album.updatedAt
        }

    data = await sync_to_async(list)(await asyncio.gather(*(serialize_album(album) for album in result_albums)))

    return JsonResponse({'data': data, 'status': 200, 'message': 'Tìm kiếm thành công!'}, status=200)

@csrf_exempt
async def search_singers(request):
    if request.method != 'GET':
        return JsonResponse({'message': 'Invalid request method'}, status=405)

    keyword = request.GET.get('keyword', '').lower()
    if not keyword:
        return JsonResponse({'message': 'Missing keyword'}, status=400)

    keyword_no_diacritics = unidecode(keyword)
    all_singers = await sync_to_async(list)(Singer.objects(deleted=False))
    result_singers = []

    def is_similar(text):
        text = text.lower()
        text_no_diacritics = unidecode(text)
        if keyword in text or keyword_no_diacritics in text_no_diacritics:
            return True
        for word in text_no_diacritics.split():
            if fuzz.partial_ratio(keyword_no_diacritics, word) > 70:
                return True
        for char in keyword_no_diacritics:
            if char in text_no_diacritics:
                return True
        return False

    for singer in all_singers:
        if len(result_singers) >= 6:
            break
        if is_similar(singer.fullName):
            result_singers.append(singer)

    async def serialize_singer(singer):
        return {
            "id": str(singer.id),
            "fullName": singer.fullName,
            "avatar": singer.avatar,
            "status": singer.status,
            "slug": singer.slug,
            "createdAt": singer.createdAt,
            "updatedAt": singer.updatedAt
        }

    data = await sync_to_async(list)(await asyncio.gather(*(serialize_singer(s) for s in result_singers)))

    return JsonResponse({'data': data, 'status': 200, 'message': 'Tìm kiếm thành công!'}, status=200)
