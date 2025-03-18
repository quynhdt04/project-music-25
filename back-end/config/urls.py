from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),  # URL mặc định của Django Admin
    path('api/', include('admin.urls')),  # Trỏ đến admin/urls.py
    path('', include('client.urls')),  # Nếu client có urls.py
]
