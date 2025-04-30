from django.urls import path

from admin.views.singer import get_all_singers, get_singer_by_id, patch_singer, create_singer, delete_singer
from admin.views.account import get_all_accounts, create_account, login, patch_account, get_account_by_id
from admin.views.role import get_all_roles, create_role, patch_role, get_role_by_id
from admin.views.song import (
    list_all_song, get_song_by_id, create_new_song, update_song_data, get_latest_song, delete_song_data, 
    delete_multiple_songs, restore_multiple_songs, get_all_pending_songs, get_number_of_top_liked_songs, 
    get_number_of_top_play_count_songs, get_songs_by_topic, get_song_by_slug, like_song, increment_play_count,
    filter_song, search_song, get_all_songs_by_singer, get_all_available_songs, filter_pending_songs,
    approve_multiple_songs, reject_multiple_songs, approve_song, reject_song, check_song_is_liked_by_user, get_song_top_play, update_song_like_view
)
from admin.views.topic import get_all_topics, create_topic, get_topic_by_id,update_topic,delete_topic, get_number_of_topics, get_topic_by_slug
from admin.views.user import get_all_users, get_user_by_id, create_user, delete_user, patch_user
from admin.views.album import (
    get_all_pending_albums, get_album_by_id, get_latest_album, get_all_albums, 
    update_album, create_new_album, delete_album, delete_multiple_albums, 
    restore_multiple_albums, search_album, filter_album, approve_multiple_albums, reject_multiple_albums,
    approve_album, reject_album
)
from admin.views.statistical import get_total_statistics,get_playcount_by_topic, get_songcount_by_topic, get_top_liked_songs

urlpatterns = [
    path('account/', login, name='account'), 
    path('accounts/', get_all_accounts, name='get_all_accounts'), 
    path('accounts/create', create_account, name='create_account'), 
    path('accounts/edit/<str:account_id>/', patch_account, name='patch_account'),
    path('accounts/<str:account_id>/', get_account_by_id, name='get_account_by_id'),

    path('roles', get_all_roles, name='get_all_roles'), 
    path('roles/create', create_role, name='create_role'), 
    path('roles/edit/<str:role_id>/', patch_role, name='patch_role'),
    path('roles/<str:role_id>/', get_role_by_id, name='get_role_by_id'),
    
    path('songs', list_all_song, name='list_all_song'),
    path('songs/search', search_song, name='search_song'),
    path('songs/<str:song_id>/', get_song_by_id, name='get_song_by_id'),
    path('songs/create', create_new_song, name='create_song'),
    path('songs/edit/<str:song_id>/', update_song_data, name='update_song_data'),
    path('songs/latest', get_latest_song, name='get_latest_song'),
    path('songs/delete/<str:song_id>/', delete_song_data, name='delete_song_data'),
    path('songs/delete-multiple', delete_multiple_songs, name='delete_multiple_songs'),
    path('songs/restore-multiple', restore_multiple_songs, name='restore_multiple_songs'),
    path('songs/get-all-pending-songs', get_all_pending_songs, name='get_all_pending_songs'),
    path('songs/get-number-of-top-liked-songs', get_number_of_top_liked_songs, name='get_number_of_top_liked_songs'),
    path('songs/get-number-of-top-play-count-songs', get_number_of_top_play_count_songs, name='get_number_of_top_play_count_songs'),
    path('songs/get-songs-by-topic/<str:topic_slug>', get_songs_by_topic, name='get_songs_by_topic'),
    path('songs/get-song-by-slug/<str:song_slug>', get_song_by_slug, name='get_song_by_slug'),
    path('songs/like/<str:song_slug>/', like_song, name='like_song'),
    path('songs/increment-play-count/<str:song_id>/', increment_play_count, name='increment_play_count'),
    path('songs/filter', filter_song, name='filter_song'),
    path('songs/get-all-songs-by-singer', get_all_songs_by_singer, name='get_all_songs_by_singer'),
    path('songs/get-all-available-songs', get_all_available_songs, name='get_all_available_songs'),
    path("songs/filter-pending-songs", filter_pending_songs, name="filter_pending_songs"),
    path("songs/approve-multiple-songs", approve_multiple_songs, name="approve_multiple_songs"),
    path("songs/reject-multiple-songs", reject_multiple_songs, name="reject_multiple_songs"),
    path("songs/approve-song/<str:song_id>/", approve_song, name="approve_song"),
    path("songs/reject-song/<str:song_id>/", reject_song, name="reject_song"),
    path("songs/check-song-is-liked-by-user", check_song_is_liked_by_user, name="check_song_is_liked_by_user"),
    path("songs/top-ten-play", get_song_top_play, name="get_song_top_play"),
    path("songs/like-song", update_song_like_view, name="update_song_like_view"),

    path('singers/',get_all_singers, name='get_all_singers'),
    path('singers/<str:singer_id>/',get_singer_by_id, name='get_singer_by_id'),
    path('singers/edit/<str:singer_id>/', patch_singer, name='patch_singer'),
    path('singers/create', create_singer, name='singer_account'),
    path('singers/delete/<str:singer_id>/', delete_singer, name='delete_singer'),

    path('topics/', get_all_topics, name='get_all_topics'),
    path('topics/create/', create_topic, name='create_topic'),
    path('topics/<str:topic_id>/', get_topic_by_id, name='get_topic_by_id'),
    path('topics/edit/<str:topic_id>/', update_topic, name='update_topic'),
    path('topics/<str:topic_id>/delete/', delete_topic, name='delete_topic'),
    path('topics/get-number-of-topics', get_number_of_topics, name='get_number_of_topics'),
    path('topics/get-topic-by-slug/<str:topic_slug>/', get_topic_by_slug, name='get_topic_by_slug'),

    path('users/', get_all_users, name='get_all_users'),
    path('users/<str:user_id>/', get_user_by_id, name='get_user_by_id'),
    path('users/edit/<str:user_id>/', patch_user, name='patch_user'),
    path('users/create', create_user, name='create_user'),
    path('users/delete/<str:user_id>/', delete_user, name='ddelete_user'),

    path('albums/get-all-pending-albums', get_all_pending_albums, name='get_all_pending_albums'),
    path('albums/get-all-albums', get_all_albums, name='get_all_albums'),
    path("albums/get-latest-album", get_latest_album, name="get_latest_album"),
    path("albums/create-album", create_new_album, name="create_new_album"),
    path("albums/get-album-by-id/<str:album_id>/", get_album_by_id, name="get_album_by_id"),
    path("albums/update-album/<str:album_id>/", update_album, name="update_album"),
    path("albums/delete-album/<str:album_id>/", delete_album, name="delete_album"),
    path("albums/restore-multiple-albums", restore_multiple_albums, name="restore_multiple_albums"),
    path("albums/delete-multiple-albums", delete_multiple_albums, name="delete_multiple_albums"),
    path("albums/search", search_album, name="search_album"),
    path("albums/filter", filter_album, name="filter_album"),
    path("albums/approve-multiple-albums", approve_multiple_albums, name="approve_multiple_albums"),
    path("albums/reject-multiple-albums", reject_multiple_albums, name="reject_multiple_albums"),
    path("albums/approve-album/<str:album_id>/", approve_album, name="approve_album"),
    path("albums/reject-album/<str:album_id>/", reject_album, name="reject_album"),

    path("statistical/total", get_total_statistics, name="get_total_statistics"),
    path("statistical/playcount-by-topic", get_playcount_by_topic, name="get_playcount_by_topic"),
    path("statistical/songcount-by-topic", get_songcount_by_topic, name="get_songcount_by_topic"),
    path("statistical/top-liked-songs", get_top_liked_songs, name="get_top_liked_songs"),
]