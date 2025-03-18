from mongoengine import connect
from django.conf import settings
# Kết nối MongoDB với mongoengine
connect(
    db="dbSpotify",
    host=settings.MONGO_URI
)

print(" Kết nối MongoDB thành công!")
