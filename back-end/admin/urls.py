from django.urls import path

from admin.views.singer import get_all_singers, get_singer_by_id, patch_singer, create_singer, delete_singer
from admin.views.account import get_all_accounts, create_account, login, patch_account, get_account_by_id
from admin.views.role import get_all_roles, create_role, patch_role, get_role_by_id
from admin.views.song import list_all_song, get_song_by_id, create_new_song, update_song_data, get_latest_song, delete_song_data, delete_multiple_songs, restore_multiple_songs, get_all_pending_songs
from admin.views.topic import get_all_topics, create_topic, get_topic_by_id,update_topic,delete_topic
from admin.views.user import get_all_users, get_user_by_id, create_user, delete_user, patch_user
from admin.views.album import get_all_pending_albums, get_album_by_id

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
    path('songs/<str:song_id>/', get_song_by_id, name='get_song_by_id'),
    path('songs/create', create_new_song, name='create_song'),
    path('songs/edit/<str:song_id>/', update_song_data, name='update_song_data'),
    path('songs/latest', get_latest_song, name='get_latest_song'),
    path('songs/delete/<str:song_id>/', delete_song_data, name='delete_song_data'),
    path('songs/delete-multiple', delete_multiple_songs, name='delete_multiple_songs'),
    path('songs/restore-multiple', restore_multiple_songs, name='restore_multiple_songs'),
    path('songs/get-all-pending-songs', get_all_pending_songs, name='get_all_pending_songs'),

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
    
    path('users/', get_all_users, name='get_all_users'),
    path('users/<str:user_id>/', get_user_by_id, name='get_user_by_id'),
    path('users/edit/<str:user_id>/', patch_user, name='patch_user'),
    path('users/create', create_user, name='create_user'),
    path('users/delete/<str:user_id>/', delete_user, name='ddelete_user'),

    path('albums/get-all-pending-albums', get_all_pending_albums, name='get_all_pending_albums'),
    path("albums/get-album-by-id/<str:album_id>/", get_album_by_id, name="get_album_by_id"),
]


