# HỆ THỐNG THƯƠNG MẠI ĐIỆN TỬ VÀ QUẢN TRỊ VẬN HÀNH KHO VẬN
> **E-Commerce & Order Management System**  
> **Dự án môn học:** Nhập môn Công nghệ Phần mềm (IT3180) – Đại học Bách khoa Hà Nội (HUST).

---

## 1. GIỚI THIỆU DỰ ÁN (PROJECT OVERVIEW)

Hệ thống Thương mại Điện tử và Quản trị Vận hành Kho Vận là nền tảng web hướng dịch vụ kết hợp giữa kênh bán hàng trực tuyến (**Storefront**) và cổng quản trị tác nghiệp nội bộ (**Back-office OMS**). 

Khác với các ứng dụng bán lẻ thông thường, dự án tập trung chuyên sâu vào giải quyết các bài toán kỹ thuật cốt lõi trong kỹ nghệ phần mềm:
* **Mô hình hóa biến thể phức tạp (Product Variants / SKU):** Tách bạch cấu trúc cha–con giữa SPU (*Standard Product Unit*) và SKU (*Stock Keeping Unit*).
* **Kiểm soát đồng thời và chống bán vượt (Concurrency Control & Overselling Prevention):** Cơ chế trừ kho thời gian thực với mô hình tồn kho 3 trạng thái.
* **Máy trạng thái đơn hàng (Order State Machine):** Quản lý chu kỳ sống của đơn hàng chặt chẽ, tự động hóa luồng hoàn kho và tích hợp thanh toán số.

---

## 2. PHÂN VAI HỆ THỐNG

Hệ thống được thiết kế theo mô hình kiểm soát truy cập dựa trên vai trò (**Role-Based Access Control - RBAC**):

* **Khách hàng (Customer):** Duyệt danh mục, tìm kiếm/lọc sản phẩm theo biến thể, quản lý giỏ hàng, đặt hàng thanh toán trực tuyến và tra cứu tiến trình vận đơn.
* **Thủ kho (Warehouse Staff):** Quản lý danh mục hàng hóa vật lý, lập phiếu nhập kho, theo dõi ngưỡng an toàn tồn kho, đóng gói và xác nhận xuất kho.
* **Quản trị viên (Super Admin):** Quản lý tài khoản và phân quyền, kiểm soát giá bán niêm yết, theo dõi dashboard phân tích doanh thu và đối soát vận hành.

---

## 3. PHẠM VI CHỨC NĂNG (SYSTEM SCOPE & CORE MODULES)

### 3.1. Phân hệ Khách hàng (Storefront)
* **Catalog & Filter:** Tìm kiếm toàn văn và lọc đa tiêu chí (danh mục, khoảng giá, các thuộc tính biến thể như màu sắc, kích cỡ, dung lượng).
* **Shopping Cart:** Quản lý giỏ hàng cục bộ và đồng bộ tài khoản; kiểm tra tính khả dụng của tồn kho trước khi chuyển sang bước thanh toán.
* **Online Checkout:** 
  * Xác thực địa chỉ giao hàng và tính toán tổng tiền.
  * Tích hợp cổng thanh toán trực tuyến **VNPay Sandbox** (mã hóa chuẩn HMAC-SHA512).
* **Order Tracking Timeline:** Tra cứu trạng thái đơn hàng theo luồng trực quan dạng stepper với mốc thời gian thực từ hệ thống.

### 3.2. Phân hệ Quản trị Vận hành (Back-Office OMS)
* **Quản lý Sản phẩm & Biến thể:** Khởi tạo ma trận thuộc tính để tự động sinh mã SKU độc lập; gán giá nhập, giá bán và hình ảnh cho từng biến thể.
* **Quản lý Tồn kho 3 Trạng thái:**
  * `Physical Quantity`: Hàng tồn thực tế trong kho.
  * `Reserved Quantity`: Hàng được khách đặt giữ chỗ (chờ thanh toán hoặc chờ đóng gói).
  * `Available Quantity`: Hàng thực tế có thể mở bán ($= \text{Physical} - \text{Reserved}$).
* **Xử lý Đơn hàng (Order State Machine):**
  * Luồng trạng thái chuẩn:  
    $$\text{Pending} \xrightarrow{\text{Thanh toán/Xác nhận}} \text{Processing} \xrightarrow{\text{Đóng gói}} \text{Packing} \xrightarrow{\text{Xuất kho}} \text{Shipping} \xrightarrow{\text{Giao thành công}} \text{Delivered}$$
  * Xử lý ngoại lệ: Khách hủy đơn hoặc quá thời hạn thanh toán (Timeout) $\rightarrow$ Tự động chuyển `Cancelled` và hoàn trả số lượng `Reserved`.
* **Quản lý Nhập hàng & Cảnh báo tồn:** Lập phiếu nhập kho từ nhà cung cấp; tự động kích hoạt cảnh báo khi số lượng khả dụng giảm xuống dưới ngưỡng an toàn (`Safety Stock Threshold`).
* **Báo cáo Thống kê:** Biểu đồ doanh thu theo chu kỳ, tỷ lệ đơn hủy/hoàn và danh sách sản phẩm bán chạy nhất.

---

## 4. KIẾN TRÚC KỸ THUẬT & CÔNG NGHỆ (TECH STACK)

* **Kiến trúc:** RESTful API Client-Server Architecture.
* **Frontend:** 
  * Client Storefront & Admin Portal: React.js / Next.js, Tailwind CSS.
  * Thư viện giao diện quản trị: Ant Design / Shadcn UI.
  * Quản trị State: Redux Toolkit hoặc Zustand.
* **Backend:** 
  * Runtime/Framework: Spring Boot.
  * Xác thực & Phân quyền: JSON Web Token (JWT) + RBAC Middleware.
* **Cơ sở dữ liệu:** 
  * Hệ quản trị CSDL quan hệ: MySQL.
* **Tích hợp bên ngoài (Integrations):**
  * Cổng thanh toán: VNPay Sandbox API.
  * Lưu trữ tài nguyên ảnh: Cloudinary API / AWS S3.
  * Nền tảng đóng gói cục bộ: Docker & Docker Compose.

---

## 5. THÀNH VIÊN VÀ PHÂN CÔNG TRÁCH NHIỆM

| STT | Họ và tên | MSSV | Vai trò chính | Trách nhiệm đảm nhiệm |
| :-: | :--- | :-: | :--- | :--- |
| 1 | *Nguyễn Đức Cường* | *202516333* | Team Lead & Backend Dev | Quản trị tiến độ, xây dựng tài liệu SRS/Use Case/UML, lập kịch bản kiểm thử (Test Plan/Postman) và chuẩn bị slide bảo vệ. |
| 2 | *Bùi Hữu Thắng* | *202516482* | Backend Dev | Hiện thực State Machine cho đơn hàng, cơ chế Transaction chống overselling, tích hợp VNPay Sandbox và API thống kê. |
| 3 | *Đặng Hồng Tuấn* | *202416633* | Backend Dev | Thiết kế lược đồ CSDL (ERD), phân hệ Auth/RBAC, quản lý danh mục sản phẩm (SPU/SKU) và API Quản lý kho. |
| 4 | *Trần Phúc Thái* | *202416603* | Frontend Dev | Thiết kế và phát triển toàn bộ giao diện Storefront (Trang chủ, Lọc sản phẩm, Giỏ hàng, Checkout, Timeline đơn). |
| 5 | *Nguyễn Khang An* | *20183677* | Frontend Dev | Xây dựng giao diện Back-office Portal (Dashboard thống kê, Quản lý sản phẩm/SKU, Màn hình xuất-nhập kho và xử lý đơn). |

---

## 6. HƯỚNG DẪN CÀI ĐẶT & CHẠY THỬ (GETTING STARTED)

### 6.1. Yêu cầu môi trường (Prerequisites)
* **Java JDK:** Khuyến nghị **Java 17 LTS** (Eclipse Adoptium Temurin hoặc Oracle JDK 17).
* **Cơ sở dữ liệu:** **MySQL Server 8.0** (cổng mặc định `3306`) hoặc sử dụng **Docker & Docker Compose**.
* **Công cụ Frontend:** VS Code với extension **Live Server** (hoặc Python 3 / Node.js để chạy local static server).
* **Git:** Phiên bản mới nhất.

---

### 6.2. Cấu hình & Khởi chạy Cơ sở dữ liệu (Database Setup)

#### Cách 1: Sử dụng MySQL Server cài trực tiếp trên máy (Khuyến nghị)
1. Đảm bảo dịch vụ MySQL đang chạy trên máy (cổng `3306`).
2. Mở MySQL Client/Workbench và tạo CSDL `testdb`:
   ```sql
   CREATE DATABASE IF NOT EXISTS testdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. Kiểm tra thông tin đăng nhập trong file [`src_back/src/main/resources/application.properties`](src_back/src/main/resources/application.properties):
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/testdb?allowPublicKeyRetrieval=true&useSSL=false&serverTimezone=UTC&characterEncoding=UTF-8
   spring.datasource.username=root
   spring.datasource.password=160422   # Đổi thành mật khẩu root MySQL trên máy của bạn
   ```

#### Cách 2: Sử dụng Docker Compose
Nếu máy bạn có cài Docker:
```bash
docker compose up -d
```
*(Lệnh này sẽ tự động khởi động một container MySQL 8.0 với database `testdb` sẵn sàng).*

---

### 6.3. Khởi chạy Backend (Spring Boot API Server)

1. Mở Terminal và di chuyển vào thư mục backend:
   ```bash
   cd src_back
   ```
2. Biên dịch và tải các thư viện cần thiết:
   * **Trên Windows (PowerShell / CMD):**
     ```powershell
     .\mvnw.cmd clean compile
     ```
   * **Trên Linux / macOS:**
     ```bash
     ./mvnw clean compile
     ```
3. Chạy ứng dụng Spring Boot:
   * **Trên Windows:**
     ```powershell
     .\mvnw.cmd spring-boot:run
     ```
   * **Trên Linux / macOS:**
     ```bash
     ./mvnw spring-boot:run
     ```
4. Khi terminal thông báo `Started EcommerceApplication in ... seconds`, API Backend đã sẵn sàng tại:
   👉 **`http://localhost:5432`**

> **💡 Cơ chế nạp dữ liệu mẫu tự động (`DataInitializer`):**  
> Khi ứng dụng khởi chạy lần đầu tiên với CSDL rỗng, hệ thống sẽ tự động khởi tạo danh mục, các gói sản phẩm gaming (Steam, PUBG, Valorant, Genshin Impact...) và tài khoản mẫu sẵn sàng sử dụng.

---

### 6.4. Khởi chạy Frontend (Storefront & Admin)
#### Cách 1: Dùng VS Code Live Server (Nhanh & Tiện nhất)
1. Cài extension **Live Server** trong VS Code.
2. Nhấp chuột phải vào file [`src_front/site.html`](src_front/site.html) $\rightarrow$ chọn **"Open with Live Server"**.
3. Trang web sẽ tự động mở trên trình duyệt tại địa chỉ:
   👉 **`http://127.0.0.1:5500/src_front/site.html`**

#### Cách 2: Dùng Python HTTP Server
```bash
cd src_front
python -m http.server 8080
```
Sau đó truy cập: `http://localhost:8080/site.html`.

---

### 6.5. Tài khoản thử nghiệm (Default Accounts)

Hệ thống đã chuẩn bị sẵn 2 tài khoản mặc định được mã hóa mật khẩu an toàn:

| Loại tài khoản | Email | Mật khẩu | Quyền hạn (Role) | Chức năng truy cập |
| :--- | :--- | :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin@giftcard.com` | `admin123` | `ROLE_ADMIN` | Quản lý kho, thêm/sửa/xóa sản phẩm, cập nhật trạng thái đơn hàng (`admin.html`). |
| **Khách hàng (Customer)** | `user@giftcard.com` | `user123` | `ROLE_USER` | Mua hàng, giỏ hàng, đặt hàng thanh toán và tra cứu đơn hàng cá nhân. |

---

### 6.6. Hướng dẫn trải nghiệm các luồng nghiệp vụ chính

```text
[Trang chủ site.html] ────► [Auth.html (Đăng nhập/Đăng ký)]
         │
         ├──► [products.html (Tìm kiếm, Lọc & Xem chi tiết)] ──► Thêm vào giỏ
         │                                                            │
         ├──► [Cart.html (Giỏ hàng)] ◄────────────────────────────────┘
         │          │
         │          └──► [Checkout.html (Thanh toán & Nhập địa chỉ)]
         │                      │
         ├──► [Orders.html] ◄───┘ (Xem lịch sử tiến trình đơn hàng)
         │
         └──► [Admin.html] (Quản lý sản phẩm & duyệt đơn - Quyền ADMIN)
```

1. **Đăng nhập / Đăng ký ([`Auth.html`](src_front/Auth.html)):**
   * Nhấp biểu tượng Avatar ở góc trên bên phải thanh điều hướng (Navbar).
   * Đăng nhập với tài khoản `user@giftcard.com` (hoặc đăng ký tài khoản mới). Sau khi đăng nhập, hệ thống tự động lưu trữ JWT token và hiển thị tên người dùng.
2. **Duyệt & Tìm kiếm sản phẩm ([`site.html`](src_front/site.html) & [`products.html`](src_front/products/products.html)):**
   * Sử dụng ô tìm kiếm trên Navbar để tìm kiếm theo tên, nhãn hàng hoặc danh mục.
   * Lọc sản phẩm theo khoảng giá, danh mục gaming, sắp xếp theo giá tăng/giảm hoặc đánh giá cao nhất.
3. **Giỏ hàng & Đặt hàng ([`Cart.html`](src_front/Cart.html) & [`Checkout.html`](src_front/Checkout.html)):**
   * Bấm **Add to Cart** tại trang chi tiết sản phẩm.
   * Nhấp biểu tượng Giỏ hàng trên Navbar để kiểm tra các mặt hàng, điều chỉnh số lượng hoặc xóa sản phẩm.
   * Chọn **Proceed to Checkout** để nhập địa chỉ giao hàng và xác nhận tạo đơn hàng.
4. **Theo dõi đơn hàng ([`Orders.html`](src_front/Orders.html)):**
   * Bấm **My Orders** trên menu để theo dõi danh sách đơn hàng đã đặt cùng trạng thái cập nhật (Pending, Confirmed, Shipped, Delivered).
5. **Trang Quản trị Back-office ([`Admin.html`](src_front/Admin.html)):**
   * Đăng nhập tài khoản Admin: `admin@giftcard.com` / `admin123`.
   * Menu **Admin** sẽ xuất hiện trên thanh Navbar.
   * **Quản lý sản phẩm:** Thêm sản phẩm mới với phân cấp danh mục 3 cấp, hình ảnh, giá niêm yết, số lượng kho; chỉnh sửa và xóa sản phẩm.
   * **Quản trị đơn hàng:** Xem toàn bộ đơn hàng của khách hàng trên hệ thống và chuyển đổi trạng thái đơn (Confirm, Ship, Deliver, Cancel).

---

### 6.7. Xử lý sự cố thường gặp (Troubleshooting)

* **Lỗi `UnsupportedClassVersionError` (Xung đột phiên bản Java):**
  * *Nguyên nhân:* Dự án được biên dịch bằng Java phiên bản cao hơn nhưng runtime chạy ở phiên bản thấp hơn.
  * *Xử lý:* Đảm bảo biến môi trường `JAVA_HOME` trỏ về JDK 17, sau đó chạy `cd src_back && .\mvnw.cmd clean compile`.
* **Lỗi `Communications link failure` (Không kết nối được MySQL):**
  * *Nguyên nhân:* Dịch vụ MySQL chưa được bật trên máy.
  * *Xử lý:* Mở Windows Services (`services.msc`), tìm dịch vụ MySQL và chọn **Start**.
* **Lỗi `Access denied for user 'root'@'localhost'`:**
  * *Nguyên nhân:* Mật khẩu MySQL trong file `application.properties` không khớp với mật khẩu MySQL trên máy của bạn.
  * *Xử lý:* Mở file [`src_back/src/main/resources/application.properties`](src_back/src/main/resources/application.properties), sửa `spring.datasource.password` thành mật khẩu chính xác của tài khoản root MySQL trên máy.
* **Giao diện không hiển thị thẻ sản phẩm (Trắng trang / Blank sections):**
  * *Nguyên nhân:* Trình duyệt lưu cache file script cũ.
  * *Xử lý:* Nhấn **`Ctrl + F5`** (hoặc `Ctrl + Shift + R`) trên trình duyệt để buộc tải lại script mới nhất.
