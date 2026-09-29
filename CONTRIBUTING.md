# QUY ĐỊNH ĐÓNG GÓP MÃ NGUỒN & QUẢN TRỊ DỰ ÁN (CONTRIBUTING GUIDELINES)
> Dành cho các thành viên phát triển dự án E-Commerce & Order Management System.

Để đảm bảo tiến độ, chất lượng mã nguồn và tránh xung đột (merge conflicts), toàn bộ 5 thành viên bắt buộc phải tuân thủ các quy tắc dưới đây.

---

## 1. QUY TẮC PHÂN NHÁNH (GIT BRANCHING STRATEGY)

* ⛔ **TUYỆT ĐỐI KHÔNG commit hoặc push trực tiếp lên nhánh `main` và `develop`.**
* **Cấu trúc nhánh chính:**
  * `main`: Nhánh chạy ổn định nhất. Chỉ merge từ `develop` khi chuẩn bị nộp bài hoặc báo cáo tiến độ với giảng viên.
  * `develop`: Nhánh tích hợp chung của toàn nhóm. Mọi tính năng sau khi test xong sẽ được merge về đây.
* **Cấu trúc nhánh làm việc (Feature branches):**
  * Tách nhánh mới từ `develop`:
    ```bash
    git checkout develop
    git pull origin develop
    git checkout -b Cuong
    ```
  * **Quy ước đặt tên nhánh:**
    * Quy ước duy nhất: đặt tên theo tên của mọi người:
    ```bash
    git branch Cuong
    git checkout Cuong 
    ```
---

## 2. QUY ƯỚC COMMIT MESSAGE (CONVENTIONAL COMMITS)

Tất cả commit message lên **BRANCH CỦA MÌNH** phải viết rõ ràng:

```text
<mô tả ngắn bằng tiếng Việt hoặc tiếng Anh>
VD: git commit -m "added user authentication"
```
Tránh các mô tả như "fix bug", "update code", "asdasd", "xong roi"

## 3. Quy Chuẩn Đặt Tên (Naming Conventions)

| Đối tượng | Quy tắc | Ví dụ chuẩn | Lưu ý |
| :--- | :--- | :--- | :--- |
| **Biến (Variables)** | `camelCase` (viết thường những từ đầu tiên, viết hoa chữ cái đầu tiên của mỗi từ tiếp theo) | `totalAmount`, `storeId` | Danh từ, tên ngắn gọn nhưng có nghĩa (tránh đặt a, b, x). |
| **Biến Boolean** | `camelCase` | `isLoading`, `isOutOfStock`,`isAvailable` | Luôn trả về true hoặc false. |
| **Hàm / Phương thức (Method / Function)** | `camelCase` | `calculateTotalAmount()`, `findBySkuCode()` | Bắt đầu bằng Động từ thể hiện hành động. |
| **Lớp (Classes / Interface / Enum)**| `PascalCase` (viết hoa chữ đầu mỗi từ) | `ProductService`, `OrderController` | Là **Danh từ** hoặc **cụm danh từ** mô tả đúng thực thể/chức năng. |
| **Package / Thư mục** | `lowercase` (chữ thường viết liền, không dấu gạch) | `com.hust.oms.controller`, `com.hust.oms.service` | Bắt đầu bằng com.it3180hust |
| **Hằng số (Constant)**| `SCREAMING_SNAKE_CASE` (in hoa toàn bộ) | `MAX_LOGIN_ATTEMPTS`, `DEFAULT_PAGE_SIZE` | Đi kèm public static final |
Sẽ còn update thêm...

```bash
Tóm tắt nhanh Naming Convention cho team Backend
com.hust.oms
├── controller/ProductController.java       -> GET /api/v1/products
├── service/ProductService.java             -> interface
├── service/impl/ProductServiceImpl.java    -> logic nghiệp vụ
├── repository/ProductRepository.java       -> findBySkuCode()
├── entity/Product.java                     -> map với bảng "products"
├── dto/request/CreateProductRequest.java   -> dữ liệu nhận vào
├── dto/response/ProductResponse.java       -> dữ liệu trả ra
└── exception/ResourceNotFoundException.java
```


## 4. Quy trình PULL REQUEST (PR)
1. Đồng bộ code mới nhất trước khi tạo PR:
```text
git checkout develop
git pull origin develop
git checkout <nhánh-của-bạn>
git merge develop
# Giải quyết conflict (nếu có) trên máy cá nhân rồi mới push
git push origin <nhánh-của-bạn>
```
2. Mở Pull Request trên Gihub (desktop/web)
* Tiêu đề PR: rõ ràng, tóm tắt công việc đã làm.
* Nội dung PR:
  * Mô tả những gì đã làm/đã sửa.
  * Đính kèm video/hình ảnh demo (nếu có). 

