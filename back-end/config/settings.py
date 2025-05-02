import os
from pathlib import Path
from decouple import config
import cloudinary
import cloudinary.uploader
import cloudinary.api

BASE_DIR = Path(__file__).resolve().parent.parent

# Bật debug trong môi trường dev
DEBUG = True

# Cho phép kết nối từ localhost
ALLOWED_HOSTS = ["127.0.0.1", "localhost", "18.214.161.189"]


# Cấu hình MongoDB (sử dụng pymongo/mongoengine)
MONGO_URI = config("MONGO_URI")

SECRET_KEY = config("DJANGO_SECRET_KEY")

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'rest_framework',
    'corsheaders',
    'cloudinary',
    'cloudinary_storage',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Địa chỉ frontend của bạn
    "http://18.214.161.189",
]

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5173",
    "http://18.214.161.189",
]

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_METHODS = [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
]

CORS_ALLOW_HEADERS = [
    "content-type",
    "authorization",
    "x-csrftoken",
]

CORS_EXPOSE_HEADERS = [
    "X-CSRFToken",
]


TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / "templates"],  # Sửa lỗi path
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

MESSAGE_STORAGE = "django.contrib.messages.storage.session.SessionStorage"


ROOT_URLCONF = 'config.urls'

# DATABASE (Chạy Django mặc định cần có database)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / "db.sqlite3",
    }
}

CLOUDINARY = {
    'cloud_name': config("CLOUDINARY_CLOUD_NAME"),  # Replace with your Cloudinary cloud name
    'api_key': config("CLOUDINARY_API_KEY"),      # Replace with your Cloudinary API key
    'api_secret': config("CLOUDINARY_API_SECRET"),  # Replace with your Cloudinary API secret
}

# Initialize Cloudinary
cloudinary.config(
    cloud_name=CLOUDINARY['cloud_name'],
    api_key=CLOUDINARY['api_key'],
    api_secret=CLOUDINARY['api_secret']
)

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Saigon'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATICFILES_DIRS = [BASE_DIR / 'static']

# VNPAY Config
VNPAY_RETURN_URL = 'http://localhost:5173/payment_return'
VNPAY_PAYMENT_URL = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html'
VNPAY_API_URL = 'https://sandbox.vnpayment.vn/merchant_webapi/api/transaction'
VNPAY_TMN_CODE = 'Y6MLF0RW'
VNPAY_HASH_SECRET_KEY = '5VCL6VNSY2SS7SYFHV15LL5T9BLNG00A'