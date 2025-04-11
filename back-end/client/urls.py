from django.urls import path
from client.views.user import register_user, login_user, update_user, get_user_by_id, update_avatar  # Thêm import get_all_users


urlpatterns = [
    path("user/create/", register_user, name="register_user"),
    # path("register/", register_user, name="register_user"),
    # path("user/", get_all_users, name="get_all_users"),
    path("user/login/", login_user, name="login_user"),
    path("update/<str:_id>/", update_user, name="update_user"),
    path("user/<str:_id>/", get_user_by_id, name="get_user_by_id"),
    path('users/<str:_id>/avatar', update_avatar, name='update_avatar'),
    
]
