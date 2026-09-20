# Hệ Thống Quản Lý Thực Tập (Internship Management System)

> Ứng dụng web hỗ trợ quản lý toàn bộ vòng đời của một đợt thực tập sinh: từ việc nhà trường mở đợt thực tập, phân công giảng viên hướng dẫn, doanh nghiệp đăng cơ hội thực tập, sinh viên ứng tuyển, xét duyệt hồ sơ, theo dõi tiến độ thực tập (kế hoạch công việc, nhật ký), cho đến đánh giá kết quả cuối kỳ.

Tài liệu này dành cho người **mới tham gia dự án**, chưa biết gì về hệ thống, giúp hiểu nhanh: hệ thống làm gì, được xây dựng như thế nào, chạy ra sao và cấu trúc mã nguồn nằm ở đâu.

---

## Mục lục

1. [Tổng quan dự án](#1-tổng-quan-dự-án)
2. [Luồng nghiệp vụ chính](#2-luồng-nghiệp-vụ-chính)
3. [Vai trò người dùng (Roles)](#3-vai-trò-người-dùng-roles)
4. [Kiến trúc hệ thống](#4-kiến-trúc-hệ-thống)
5. [Công nghệ sử dụng](#5-công-nghệ-sử-dụng)
6. [Cấu trúc thư mục](#6-cấu-trúc-thư-mục)
7. [Cài đặt & Chạy dự án](#7-cài-đặt--chạy-dự-án)
8. [Cấu hình Keycloak (xác thực & phân quyền)](#8-cấu-hình-keycloak-xác-thực--phân-quyền)
9. [Danh sách chức năng theo từng service](#9-danh-sách-chức-năng-theo-từng-service)
10. [Cơ sở dữ liệu](#10-cơ-sở-dữ-liệu)
11. [Một số lưu ý khi phát triển](#11-một-số-lưu-ý-khi-phát-triển)
12. [Câu hỏi thường gặp](#12-câu-hỏi-thường-gặp)

---

## 1. Tổng quan dự án

**Internship Management System** là hệ thống giúp một trường học/khoa quản lý quy trình thực tập của sinh viên, kết nối 3 nhóm đối tượng:

- **Nhà trường (Admin)**: tạo đợt thực tập, phân công giảng viên hướng dẫn cho từng đợt.
- **Doanh nghiệp (Company)**: đăng cơ hội thực tập, duyệt hồ sơ ứng tuyển, giao việc, theo dõi và đánh giá thực tập sinh.
- **Giảng viên (Lecturer)**: duyệt hồ sơ đăng ký thực tập của sinh viên mình phụ trách, theo dõi tiến độ và đánh giá sinh viên.
- **Sinh viên (Student)**: tìm và ứng tuyển cơ hội thực tập, theo dõi trạng thái hồ sơ, thực hiện công việc được giao, ghi nhật ký thực tập, xem kết quả đánh giá.

Mục tiêu là số hóa toàn bộ quy trình thực tập — thay vì quản lý bằng Excel/email — với một luồng trạng thái rõ ràng, minh bạch cho tất cả các bên.

---

## 2. Luồng nghiệp vụ chính

```text
ADMIN tạo Đợt thực tập (Internship Period)
        ↓
ADMIN phân công Giảng viên hướng dẫn cho đợt
        ↓
DOANH NGHIỆP tạo Cơ hội thực tập (Opportunity)
        ↓
SINH VIÊN ứng tuyển vào Cơ hội thực tập
        ↓
DOANH NGHIỆP duyệt hồ sơ ứng tuyển
        ↓
GIẢNG VIÊN duyệt hồ sơ ứng tuyển
        ↓
Hồ sơ chuyển sang trạng thái ĐANG THỰC TẬP (IN_PROGRESS)
        ↓
Doanh nghiệp lập Kế hoạch công việc (Work Plan) → giao Công việc (Task)
Sinh viên thực hiện công việc và ghi Nhật ký thực tập (Internship Log)
        ↓
DOANH NGHIỆP đánh giá sinh viên  →  trạng thái "Doanh nghiệp đã đánh giá"
        ↓
GIẢNG VIÊN đánh giá sinh viên    →  trạng thái "HOÀN THÀNH"
        ↓
Điểm tổng kết = 80% điểm Doanh nghiệp + 20% điểm Giảng viên
```

### Các trạng thái hồ sơ đăng ký (Registration status)

| Trạng thái | Ý nghĩa |
|---|---|
| `PENDING_COMPANY` | Chờ doanh nghiệp duyệt |
| `REJECTED_COMPANY` | Doanh nghiệp từ chối |
| `PENDING_LECTURER` | Chờ giảng viên duyệt |
| `REJECTED_LECTURER` | Giảng viên từ chối |
| `IN_PROGRESS` | Đang thực tập |
| `COMPLETED_COMPANY` | Doanh nghiệp đã đánh giá, chờ giảng viên đánh giá |
| `COMPLETED` | Đã hoàn thành (cả hai bên đã đánh giá) |

> Lưu ý kỹ thuật: hệ thống có **hai trạng thái song song** — trạng thái của *hồ sơ đăng ký* (`InternshipRegistration.status`, do `internship-service` quản lý xuyên suốt quy trình duyệt) và trạng thái của *đợt thực tập đã được duyệt* (`Internship.status`, chỉ tồn tại sau khi hồ sơ được duyệt xong). Hai bảng trạng thái này được đồng bộ thủ công tại các điểm chuyển pha (duyệt, đánh giá).

---

## 3. Vai trò người dùng (Roles)

Hệ thống dùng **Keycloak** để xác thực và phân quyền theo 4 vai trò:

| Vai trò | Mô tả | Trang chính sau đăng nhập |
|---|---|---|
| `ADMIN` | Quản trị hệ thống, tạo đợt thực tập, phân công giảng viên, quản lý người dùng | `/admin/periods`, `/users` |
| `COMPANY` | Doanh nghiệp tiếp nhận thực tập sinh | `/company/opportunities`, `/company/registrations`, `/company/work-plans`, `/company/tasks`, `/company/logs`, `/company/evaluations` |
| `LECTURER` | Giảng viên hướng dẫn/duyệt hồ sơ | `/lecturer/periods`, `/lecturer/registrations/pending`, `/lecturer/students` |
| `STUDENT` | Sinh viên thực tập | `/student/opportunities`, `/student/registrations`, `/student/workspace/:id` |

Mỗi vai trò chỉ nhìn thấy menu và trang tương ứng (được cấu hình trong `frontend/src/components/layout/MainLayout.tsx` và bảo vệ route bằng `RoleRoute` trong `frontend/src/routes/AppRoutes.tsx`).

---

## 4. Kiến trúc hệ thống

Dự án theo kiến trúc **microservices**, mỗi service có database Postgres riêng, giao tiếp qua REST API (gọi trực tiếp từ frontend tới từng service):

```text
                        ┌─────────────────────┐
                        │      Keycloak        │  (xác thực / JWT / phân quyền)
                        │   :8080               │
                        └──────────┬───────────┘
                                   │
                   Access Token (JWT) đính kèm mọi request
                                   │
        ┌──────────────────────────┼──────────────────────────┐
        │                          │                          │
┌───────▼────────┐        ┌────────▼─────────┐       ┌────────▼─────────┐
│  user-service   │        │ internship-service│       │ evaluation-service│
│  :8081          │        │  :8082             │       │  :8083            │
│                 │        │                     │       │                    │
│ - Quản lý User  │        │ - Đợt thực tập      │       │ - Đánh giá của     │
│ - Sinh viên/    │        │ - Cơ hội thực tập   │       │   doanh nghiệp     │
│   Giảng viên/   │        │ - Đăng ký/duyệt hồ sơ│      │ - Đánh giá của     │
│   Doanh nghiệp  │        │ - Internship (post- │       │   giảng viên       │
│   profile       │        │   approval)         │       │ - Tổng hợp điểm    │
│                 │        │ - Work Plan / Task   │       │                    │
│                 │        │ - Internship Log     │       │                    │
└───────┬─────────┘        └────────┬─────────────┘       └────────┬───────────┘
        │                           │                              │
┌───────▼────────┐        ┌─────────▼──────────┐       ┌───────────▼──────────┐
│  user-db        │        │  internship-db      │       │  evaluation-db        │
│  Postgres :5433 │        │  Postgres :5434      │       │  Postgres :5435        │
└─────────────────┘        └──────────────────────┘       └────────────────────────┘

                        ┌──────────────────────┐
                        │      frontend         │
                        │  React + Vite :5173   │
                        │  gọi trực tiếp cả 3    │
                        │  service ở trên qua    │
                        │  REST + JWT            │
                        └──────────────────────┘
```

Vì không có API Gateway, **frontend gọi thẳng đến từng service** theo URL/port tương ứng (xem `frontend/src/api/*.ts`), mỗi request đều đính kèm access token lấy từ Keycloak.

---

## 5. Công nghệ sử dụng

### Backend (3 service: `user-service`, `internship-service`, `evaluation-service`)

- **Java 21**
- **Quarkus** (framework Java hiệu năng cao, hỗ trợ dev-mode hot reload)
- **Hibernate ORM với Panache** (truy vấn dữ liệu)
- **RESTEasy Reactive** (xây REST API)
- **PostgreSQL 16** (mỗi service có 1 database riêng — database-per-service)
- **Quarkus OIDC / SmallRye JWT** (xác thực bằng access token của Keycloak)
- **Maven** (quản lý build/dependency)

### Frontend

- **React 19 + TypeScript**
- **Vite** (dev server & build tool)
- **React Router v7** (điều hướng, phân quyền theo route)
- **Bootstrap 5 + Bootstrap Icons** (giao diện, theo phong cách Modern SaaS UI)
- **keycloak-js** (tích hợp đăng nhập SSO với Keycloak)

### Hạ tầng

- **Keycloak 26** (Identity & Access Management — xác thực, JWT, quản lý user/role)
- **Docker & Docker Compose** (chạy toàn bộ hệ thống — Postgres, Keycloak, các service — bằng 1 lệnh)

---

## 6. Cấu trúc thư mục

```text
internship-management-system/
├── docker-compose.yml              # Định nghĩa toàn bộ hạ tầng: DB, Keycloak, các service
├── README.md                       # Tài liệu này
├── INTERNSHIP_MANAGEMENT_COPILOT_REQUIREMENTS_EN.md  # Tài liệu yêu cầu nghiệp vụ chi tiết (tiếng Anh)
│
├── user-service/                   # Service quản lý người dùng & hồ sơ (Student/Lecturer/Company)
│   └── src/main/java/cit/internship/
│       ├── controller/             # REST API: UserController (/api/users/**)
│       ├── service/                # ProfileService, UserService...
│       ├── entity/                 # User, Student, Lecturer, Company...
│       └── dto/
│
├── internship-service/             # Service lõi nghiệp vụ thực tập
│   └── src/main/java/cit/internship/
│       ├── controller/
│       │   ├── InternshipPeriodController.java       # Đợt thực tập
│       │   ├── InternshipOpportunityController.java  # Cơ hội thực tập
│       │   ├── InternshipRegistrationController.java # Đăng ký / duyệt hồ sơ
│       │   ├── InternshipController.java             # Internship sau khi được duyệt
│       │   ├── WorkPlanController.java                # Kế hoạch công việc
│       │   ├── TaskController.java                    # Công việc (Task)
│       │   └── InternshipLogController.java           # Nhật ký thực tập
│       ├── service/
│       ├── entity/                 # InternshipPeriod, Opportunity, Registration, Internship, WorkPlan, Task, Log
│       └── dto/
│
├── evaluation-service/             # Service đánh giá kết quả thực tập
│   └── src/main/java/cit/evaluation/
│       ├── controller/
│       │   ├── CompanyEvaluationController.java   # Đánh giá của doanh nghiệp
│       │   ├── LecturerEvaluationController.java  # Đánh giá của giảng viên
│       │   └── EvaluationSummaryController.java   # Tổng hợp điểm (80% DN + 20% GV)
│       ├── service/
│       └── entity/
│
└── frontend/                       # Ứng dụng web React
    └── src/
        ├── api/                    # Hàm gọi REST API tới từng service (user-api, internship-api, ...)
        ├── components/
        │   ├── layout/MainLayout.tsx   # Layout khung sườn: Header + Sidebar + nội dung
        │   └── ui/                     # StatusBadge, PageHeader, ConfirmModal, StatCard...
        ├── hooks/useAuth.ts         # Hook đọc thông tin đăng nhập/role/tên từ Keycloak JWT
        ├── pages/
        │   ├── admin/               # Trang dành cho ADMIN
        │   ├── company/             # Trang dành cho COMPANY
        │   ├── lecturer/            # Trang dành cho LECTURER
        │   └── student/             # Trang dành cho STUDENT
        ├── routes/AppRoutes.tsx     # Khai báo toàn bộ route + phân quyền theo vai trò
        └── types/                   # Định nghĩa kiểu dữ liệu dùng chung (status, role...)
```

---

## 7. Cài đặt & Chạy dự án

### Yêu cầu môi trường

- Docker & Docker Compose
- Node.js 18+ (để chạy frontend riêng ở chế độ dev)
- (Tùy chọn) Java 21 + Maven nếu muốn chạy backend ngoài Docker

### Bước 1 — Chạy hạ tầng backend bằng Docker Compose

```powershell
docker-compose up -d
```

Lệnh trên sẽ khởi động:

| Thành phần | Cổng (port) |
|---|---|
| Keycloak | http://localhost:8080 |
| user-service | http://localhost:8081 |
| internship-service | http://localhost:8082 |
| evaluation-service | http://localhost:8083 |
| user-db (Postgres) | 5433 |
| internship-db (Postgres) | 5434 |
| evaluation-db (Postgres) | 5435 |

Mỗi service Quarkus chạy ở chế độ `quarkus:dev` (dev-mode), tự động biên dịch lại khi mã nguồn thay đổi (live reload).

### Bước 2 — Cấu hình Keycloak (chỉ cần làm 1 lần)

Xem chi tiết ở mục [8. Cấu hình Keycloak](#8-cấu-hình-keycloak-xác-thực--phân-quyền) bên dưới.

### Bước 3 — Chạy frontend

```powershell
cd frontend
npm install
npm run dev
```

Mặc định frontend chạy tại: **http://localhost:5173**

### Các lệnh hữu ích khác

```powershell
# Build & kiểm tra kiểu dữ liệu frontend
cd frontend
npm run build          # tsc -b && vite build
npx tsc --noEmit        # chỉ kiểm tra type, không build

# Biên dịch một backend service (không chạy)
cd user-service
./mvnw compile
```

---

## 8. Cấu hình Keycloak (xác thực & phân quyền)

Hệ thống dùng Keycloak để đăng nhập và cấp JWT access token.

1. Truy cập Keycloak Admin Console: http://localhost:8080 (đăng nhập bằng `admin` / `admin`).
2. Tạo **Realm** tên: `internship-management`.
3. Tạo **Client** tên: `internship-management-app` (public client, dùng cho frontend, bật Standard Flow).
4. Tạo 4 **Realm Role**: `ADMIN`, `COMPANY`, `LECTURER`, `STUDENT`.
5. Tạo user cho từng vai trò và gán role tương ứng (ví dụ: `admin01`, `company01`, `lecturer01`, `student01`...). Nhớ điền đầy đủ **First name / Last name** cho mỗi user — hệ thống hiển thị tên đầy đủ này ở header, sidebar và trong các trang tra cứu (tên sinh viên, doanh nghiệp, giảng viên).
6. Access token phải chứa các claim: `sub`, `preferred_username`, `given_name`, `family_name`, `name`, `email` và danh sách role trong `realm_access.roles` — đây là các claim mà backend (`user-service`) và frontend (`useAuth.ts`) dùng để xác định danh tính và quyền của người dùng.

> Lưu ý: mỗi service backend xác thực JWT độc lập (không qua gateway chung), cấu hình OIDC issuer nằm trong `application.properties` của từng service (trỏ về realm `internship-management` ở Keycloak).

---

## 9. Danh sách chức năng theo từng service

### 9.1. `user-service` (cổng 8081)

- Đồng bộ thông tin người dùng từ Keycloak vào database nội bộ khi đăng nhập lần đầu / mỗi lần gọi `/api/users/me` (tên, email luôn được cập nhật theo Keycloak để tránh dữ liệu cũ).
- Quản lý hồ sơ mở rộng theo vai trò: `Student`, `Lecturer`, `Company` (mã số, khoa/phòng ban, thông tin liên hệ...).
- Cung cấp API tra cứu thông tin người dùng cho các service khác hiển thị (ví dụ: doanh nghiệp/giảng viên xem tên đầy đủ của sinh viên).
- Quản lý danh sách người dùng cho ADMIN (`/users`).

### 9.2. `internship-service` (cổng 8082) — service lõi nghiệp vụ

- **Đợt thực tập (Internship Period)**: ADMIN tạo/sửa/mở/đóng đợt thực tập, phân công giảng viên phụ trách.
- **Cơ hội thực tập (Opportunity)**: COMPANY tạo cơ hội thực tập (vị trí, mô tả, số lượng, trạng thái Đang mở/Đã đóng).
- **Đăng ký thực tập (Registration)**: STUDENT ứng tuyển vào cơ hội; COMPANY duyệt → LECTURER duyệt (2 vòng duyệt tuần tự); từ chối ở bất kỳ vòng nào sẽ dừng hồ sơ.
- **Internship**: được tạo tự động khi hồ sơ được duyệt qua cả 2 vòng, theo dõi trạng thái thực tập thực tế (đang thực tập → doanh nghiệp đã đánh giá → hoàn thành).
- **Kế hoạch công việc (Work Plan)** và **Công việc (Task)**: doanh nghiệp lập kế hoạch, giao việc cụ thể cho sinh viên trong quá trình thực tập.
- **Nhật ký thực tập (Internship Log)**: sinh viên ghi lại nhật ký hằng ngày/tuần trong quá trình thực tập.

### 9.3. `evaluation-service` (cổng 8083)

- **Đánh giá của doanh nghiệp**: doanh nghiệp chấm điểm/nhận xét sinh viên sau khi kết thúc thực tập.
- **Đánh giá của giảng viên**: giảng viên chấm điểm/nhận xét dựa trên theo dõi quá trình + báo cáo.
- **Tổng hợp điểm**: tính điểm cuối cùng = 80% điểm doanh nghiệp + 20% điểm giảng viên; khi cả hai đánh giá tồn tại, hồ sơ được tự động chuyển sang trạng thái **HOÀN THÀNH**.

### 9.4. `frontend`

- Đăng nhập/đăng xuất qua Keycloak SSO (`keycloak-js`), tự động lấy `given_name` + `family_name` để hiển thị tên đầy đủ ở header/sidebar.
- Bố cục chung: Header (trắng, chữ đen) + Sidebar theo vai trò + khu vực nội dung chính.
- Giao diện quản lý riêng cho từng vai trò (ADMIN/COMPANY/LECTURER/STUDENT) như liệt kê ở mục 3.
- Toàn bộ nhãn trạng thái, tiêu đề trang, nút bấm đã được Việt hóa (badge trạng thái, tên cột, tên nút thao tác...).

---

## 10. Cơ sở dữ liệu

Theo mô hình **1 service — 1 database** (database-per-service), không chia sẻ bảng giữa các service:

| Database | Service sở hữu | Cổng (khi chạy qua Docker) |
|---|---|---|
| `user_db` | user-service | 5433 |
| `internship_db` | internship-service | 5434 |
| `evaluation_db` | evaluation-service | 5435 |

Quarkus dùng `quarkus.hibernate-orm.database.generation=update` ở môi trường dev để tự động cập nhật schema theo entity. Lưu ý: cơ chế này **không** tự cập nhật các ràng buộc `CHECK` khi thêm giá trị mới vào enum của một cột đã tồn tại — cần chỉnh tay (ALTER TABLE) ở dev hoặc dùng migration (Flyway/Liquibase) ở production.

Kết nối trực tiếp vào DB (khi chạy qua Docker Compose) để kiểm tra dữ liệu, ví dụ:

```powershell
docker exec -it user-db psql -U postgres -d user_db
```

---

## 11. Một số lưu ý khi phát triển

- **Hai trạng thái song song**: `InternshipRegistration.status` và `Internship.status` là hai cột/enum khác nhau ở hai giai đoạn (trước và sau khi hồ sơ được duyệt). Khi thêm nghiệp vụ mới liên quan đến trạng thái, cần đồng bộ cả hai.
- **`JsonWebToken.getName()` không trả về họ tên đầy đủ**: theo chuẩn MicroProfile JWT, hàm này trả về claim `upn` (mặc định Keycloak set bằng username), **không phải** claim `name`. Muốn lấy họ tên đầy đủ, phải đọc trực tiếp `jwt.getClaim("name")`.
- **Không có API Gateway**: frontend gọi thẳng tới từng service theo cổng riêng; khi deploy production cần cấu hình CORS/reverse proxy phù hợp cho từng service.
- **Không dùng framework CSS/UI nào khác ngoài Bootstrap 5** trừ khi có yêu cầu rõ ràng (xem tài liệu yêu cầu chi tiết).
- Tài liệu yêu cầu nghiệp vụ đầy đủ (bằng tiếng Anh, dùng làm kim chỉ nam khi phát triển bằng AI/Copilot) nằm ở file [`INTERNSHIP_MANAGEMENT_COPILOT_REQUIREMENTS_EN.md`](./INTERNSHIP_MANAGEMENT_COPILOT_REQUIREMENTS_EN.md).

---

## 12. Câu hỏi thường gặp

**Vì sao đăng nhập được nhưng vào trang bị chuyển hướng về Dashboard?**
→ Kiểm tra tài khoản đó trên Keycloak đã được gán đúng Realm Role (`ADMIN`/`COMPANY`/`LECTURER`/`STUDENT`) chưa — `RoleRoute` trong frontend sẽ tự chuyển hướng nếu vai trò không khớp với route.

**Vì sao tên hiển thị là username thay vì họ tên đầy đủ?**
→ Kiểm tra user đó trên Keycloak đã điền đủ First name/Last name chưa, và đảm bảo access token có claim `name`/`given_name`/`family_name` (bật ở client scope `profile`).

**Sửa code backend xong có cần khởi động lại service không?**
→ Không, các service chạy ở `quarkus:dev` sẽ tự biên dịch lại (hot reload) khi có request mới tới sau khi mã nguồn thay đổi.

**Thêm giá trị mới cho một enum trạng thái nhưng bị lỗi ràng buộc CHECK khi lưu dữ liệu?**
→ Đây là do Hibernate không tự nới ràng buộc `CHECK` cũ khi ở chế độ `update`. Cần `ALTER TABLE ... DROP/ADD CONSTRAINT` thủ công trong DB dev, hoặc viết migration chính thức cho production.
