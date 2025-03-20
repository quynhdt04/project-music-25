from django.urls import path
from admin.views.account import get_all_accounts, create_account, login, patch_account, get_account_by_id
from admin.views.role import get_all_roles, create_role, patch_role, get_role_by_id

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
]
