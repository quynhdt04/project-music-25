from django.urls import path
from client.views.user import register_user, login_user, update_user, get_user_by_id, update_avatar # Thêm import get_all_users
# from client.views import payment_success_callback 
from client.views.vnpay import payment, payment_ipn, payment_return, query, refund


from client.views.user import register_user, login_user, update_user, get_user_by_id, update_avatar  # Thêm import get_all_users
from client.views.playlist import get_all_playList, create_playlist, patch_playlist, get_play_list_by_id, add_song_to_playlist
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
    path('play-list/addSong/<str:playlist_id>/', add_song_to_playlist, name="add_song_to_playlist"),

    path('favorite/create/', create_favorite_song, name="create_favorite_song"),
    path('favorite/<str:user_id>/', get_favorite_songs, name="get_favorite_songs"),
    path('payment', payment, name='payment'),
    path('payment_ipn', payment_ipn, name='payment_ipn'),
    path("api/payment-return", payment_return, name='payment_return'),
    path('query', query, name='query'),
    path('refund', refund, name='refund'),
]
