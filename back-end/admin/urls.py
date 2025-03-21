from django.urls import path
from admin.views.account import get_all_accounts, create_account, login
from admin.views.singer import get_all_singers
from admin.views.role import get_all_roles, create_role, patch_role, get_role_by_id

urlpatterns = [
    path('account/', login, name='account'), 
    path('accounts/', get_all_accounts, name='get_all_accounts'), 
    path('accounts/create', create_account, name='create_account'), 
    path('roles', get_all_roles, name='get_all_roles'), 
    path('roles/create', create_role, name='create_role'), 
    path('roles/edit/<str:role_id>/', patch_role, name='patch_role'),
    path('roles/<str:role_id>/', get_role_by_id, name='get_role_by_id'),
    path('singers/',get_all_singers, name='get_all_singers'),
]
