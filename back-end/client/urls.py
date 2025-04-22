from django.urls import path
from client.views.user import register_user, login_user, update_user, get_user_by_id, update_avatar  # Thêm import get_all_users
from client.views.playlist import get_all_playList, create_playlist, patch_playlist, get_play_list_by_id
from client.views.favoriteSongs import create_favorite_song, get_favorite_songs

urlpatterns = [
    path("user/create/", register_user, name="register_user"),
    # path("register/", register_user, name="register_user"),
    # path("user/", get_all_users, name="get_all_users"),
    path("user/login/", login_user, name="login_user"),
    path("update/<str:_id>/", update_user, name="update_user"),
    path("user/<str:_id>/", get_user_by_id, name="get_user_by_id"),
    path('users/<str:_id>/avatar', update_avatar, name='update_avatar'),
    path('play-list/', get_all_playList, name="get_all_playList"),
    path('play-list/<str:playlist_id>/', get_play_list_by_id, name="get_play_list_by_id"),
    path('play-list/create', create_playlist, name="create_playlist"),
    path('play-list/edit/<str:playlist_id>/', patch_playlist, name="patch_playlist"),

    path('favorite/create/', create_favorite_song, name="create_favorite_song"),
    path('favorite/<str:user_id>/', get_favorite_songs, name="get_favorite_songs"),
]
