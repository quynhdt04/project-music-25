# Hướng dẫn cài đặt đồ án

## Cài đặt Backend

1. **Cài đặt Python 3.10+ và pip**  
   Tải Python tại [python.org](https://www.python.org/downloads/)

2. **Clone đồ án về máy**
   ```bash
   git clone <url_repository>
   cd <tên_thư_mục_repository>
   ```

3. **Tạo môi trường ảo (virtual environment)**
   ```bash
   python3.12 -m venv myvenv
   ```

4. **Kích hoạt môi trường ảo**
   - Trên **Windows**:
     ```bash
     myvenv\Scripts\activate
     ```
   - Trên **Linux/MacOS**:
     ```bash
     source myvenv/bin/activate
     ```

5. **Cài đặt thư viện**
   ```bash
   pip install -r requirements.txt
   ```

6. **Chạy server**
   ```bash
   python index.py runserver
   ```

---

## Cài đặt Frontend

1. **Cài đặt Node.js và npm**  
   Tải tại [nodejs.org](https://nodejs.org/) (yêu cầu Node.js >= 16)

2. **Di chuyển vào thư mục frontend**
   ```bash
   cd frontend
   ```

3. **Cài đặt các gói**
   ```bash
   npm install
   ```

4. **Chạy frontend**
   ```bash
   npm run dev
   ```

---

## Kết nối cơ sở dữ liệu

- **Cơ sở dữ liệu:** MongoDB phiên bản 6.0+
- **Thông tin kết nối:**  
  Cấu hình trong file `.env`. Đảm bảo MongoDB đang chạy và chuỗi kết nối chính xác.
