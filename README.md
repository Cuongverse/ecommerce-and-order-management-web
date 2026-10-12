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

### 6.1. Yêu cầu môi trường
* Node.js $\ge$ 18.x hoặc Java JDK $\ge$ 17.
* Docker & Docker Compose.
* Git.

### 6.2. Các bước khởi chạy cục bộ (Local Development)

1. **Clone mã nguồn dự án:**
   ```bash
   git clone https://github.com/Cuongverse/ecommerce-and-order-management-web.git
   ```
2. **Chuyển tới thư mục dự án và chạy:**
  ```bash
  cd ecommerce
  (sẽ còn cập nhật thêm)
  ```