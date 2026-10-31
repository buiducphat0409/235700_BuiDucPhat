# Quản lý thiết bị phòng học

**Sinh viên:** Bùi Đức Phát - MSSV 235700

## 1. Giới thiệu

Xây dựng hệ thống quản lý thiết bị phòng học trên nền tảng điện toán đám mây, hỗ trợ thêm, xem, sửa, xóa và tìm kiếm thiết bị.

## 2. Công nghệ sử dụng

- Frontend: React
- Backend: Node.js, Express
- Database: MongoDB Atlas
- Công cụ: Git, GitHub, Docker, Docker Hub, Render

## 3. Cấu trúc dự án

235700_BuiDucPhat/
├── README.md
├── .gitignore
├── backend/ # REST API (Node.js, Express, MongoDB Atlas)
└── frontend/ # Giao diện web (React)

## 4. Hướng dẫn cài đặt và chạy chương trình

### Yêu cầu

- Node.js 20 trở lên, Git
- Tài khoản MongoDB Atlas

### Chạy backend

cd backend
cp .env.example .env # điền MONGODB_URI trong .env
npm install
npm start

### Chạy frontend

cd frontend
cp .env.example .env # VITE_API_URL=http://localhost:5000
npm install
npm run dev

Lưu ý: không commit tệp .env lên GitHub.

## 5. Chạy backend bằng Docker

```bash
docker build -t buiducphat0409/backend ./backend
docker run -d -p 5000:5000 -e MONGODB_URI="<chuỗi kết nối MongoDB Atlas>" -e CORS_ORIGIN="*" buiducphat0409/backend
```

Docker Hub: https://hub.docker.com/r/buiducphat0409/backend

## 6. Chạy frontend bằng Docker

```bash
docker build --build-arg VITE_API_URL=<URL backend API> -t buiducphat0409/frontend ./frontend
docker run -d -p 5173:80 buiducphat0409/frontend
```

Docker Hub: https://hub.docker.com/r/buiducphat0409/frontend
