from django.urls import path
from client.views.user import register_user, login_user, update_user, get_user_by_id, update_avatar # Thêm import get_all_users
# from client.views import payment_success_callback 
from client.views.vnpay import payment, payment_ipn, payment_return, query, refund



urlpatterns = [
    path("user/create/", register_user, name="register_user"),
    # path("register/", register_user, name="register_user"),
    # path("user/", get_all_users, name="get_all_users"),
    path("user/login/", login_user, name="login_user"),
    path("update/<str:_id>/", update_user, name="update_user"),
    path("user/<str:_id>/", get_user_by_id, name="get_user_by_id"),
    path('users/<str:_id>/avatar', update_avatar, name='update_avatar'),
    # path('payment/success/', payment_success_callback, name='payment_success_callback'),
#    path('', index, name='index'),
    path('payment', payment, name='payment'),
    path('payment_ipn', payment_ipn, name='payment_ipn'),
    path('payment_return', payment_return, name='payment_return'),
    path('query', query, name='query'),
    path('refund', refund, name='refund'),
]
