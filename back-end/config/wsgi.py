<<<<<<< HEAD
import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
=======
"""
WSGI config for vnpay_python project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/1.10/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "vnpay_python.settings")
>>>>>>> 3a10e04ea40976743dd61427d9a6dd1bcfffa9ef

application = get_wsgi_application()
