from django.urls import path
from client.views.user import register_user, login_user, update_user_profile, get_user_by_id  # Thêm import get_all_users


urlpatterns = [
    path("register/", register_user, name="register_user"),
    # path("user/", get_all_users, name="get_all_users"),
    path("user/login/", login_user, name="login_user"),
    path("update/<int:pk>/", update_user_profile, name="update_user_profile"),
    path("user/<int:pk>/", get_user_by_id, name="get_user_by_id"),
]
