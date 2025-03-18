import os
import sys
from pathlib import Path

def main():
    """Hàm chính để chạy Django."""

    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")  

    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Không thể import Django. Bạn đã cài đặt nó chưa?"
        ) from exc
    execute_from_command_line(sys.argv)

if __name__ == "__main__":
    main()
