from django.urls import path
from client.views.user import register_user, get_all_users

urlpatterns = [
    path("register/", register_user, name="register_user"),
    path("user/", get_all_users, name="get_all_users"),
]
