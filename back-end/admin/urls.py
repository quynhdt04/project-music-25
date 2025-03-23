from django.urls import path
from admin.views.account import get_all_accounts, create_account, login
from admin.views.role import get_all_roles, create_role, patch_role, get_role_by_id
from admin.views.song import list_all_song, get_song_by_id, create_new_song, update_song_data, get_latest_song, delete_song_data, delete_multiple_songs, restore_multiple_songs

urlpatterns = [
    path('account/', login, name='account'), 
    path('accounts/', get_all_accounts, name='get_all_accounts'), 
    path('accounts/create', create_account, name='create_account'), 
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
]
