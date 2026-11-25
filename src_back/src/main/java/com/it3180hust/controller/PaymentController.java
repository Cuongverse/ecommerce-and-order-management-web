// package com.it3180hust.controller;

// import java.net.URLEncoder;
// import java.nio.charset.StandardCharsets;
// import java.security.MessageDigest;
// import java.util.Map;
// import java.util.TreeMap;

// import javax.crypto.Mac;
// import javax.crypto.spec.SecretKeySpec;

// import jakarta.servlet.http.HttpServletRequest;

// import org.springframework.web.bind.annotation.GetMapping;
// import org.springframework.web.bind.annotation.RequestMapping;
// import org.springframework.web.bind.annotation.RequestParam;
// import org.springframework.web.bind.annotation.RestController;

// import com.it3180hust.config.VNPayConfig;
// import com.it3180hust.model.Order;
// import com.it3180hust.service.OrderService;
// // import com.it3180hust.service.PaymentService;

// @RestController
// @RequestMapping("/api/payment")
// public class PaymentController {

//     // private final PaymentService paymentService;
//     private final OrderService orderService;

//     public PaymentController(
//                              OrderService orderService) {
//         // this.paymentService = paymentService;
//         this.orderService = orderService;
//     }

//     @GetMapping("/create-payment-url")
//     public String createPaymentUrl(@RequestParam Long orderId,
//                                    HttpServletRequest request) throws Exception {

//         String ipAddress = request.getRemoteAddr();

//         String forwardedFor = request.getHeader("X-Forwarded-For");

//         if (forwardedFor != null && !forwardedFor.isBlank()) {
//             ipAddress = forwardedFor.split(",")[0].trim();
//         }

//         return paymentService.createPaymentUrl(orderId, ipAddress);
//     }

//     @GetMapping("/vnpay-callback")
//     public String vnpayCallback(@RequestParam Map<String, String> params)
//             throws Exception {

//         String secureHash = params.get("vnp_SecureHash");

//         if (secureHash == null) {
//             return "Invalid payment signature";
//         }

//         Map<String, String> fields = new TreeMap<>(params);

//         fields.remove("vnp_SecureHash");
//         fields.remove("vnp_SecureHashType");

//         StringBuilder hashData = new StringBuilder();

//         for (Map.Entry<String, String> entry : fields.entrySet()) {

//             if (hashData.length() > 0) {
//                 hashData.append("&");
//             }

//             hashData.append(URLEncoder.encode(
//                     entry.getKey(), StandardCharsets.UTF_8));

//             hashData.append("=");

//             hashData.append(URLEncoder.encode(
//                     entry.getValue(), StandardCharsets.UTF_8));
//         }

//         Mac hmac = Mac.getInstance("HmacSHA512");

//         SecretKeySpec secretKey = new SecretKeySpec(
//                 VNPayConfig.VNPAY_HASH_SECRET.getBytes(StandardCharsets.UTF_8),
//                 "HmacSHA512"
//         );

//         hmac.init(secretKey);

//         byte[] hash = hmac.doFinal(
//                 hashData.toString().getBytes(StandardCharsets.UTF_8));

//         StringBuilder calculatedHash = new StringBuilder();

//         for (byte b : hash) {
//             calculatedHash.append(String.format("%02x", b));
//         }

//         boolean validSignature = MessageDigest.isEqual(
//                 calculatedHash.toString().getBytes(StandardCharsets.UTF_8),
//                 secureHash.toLowerCase().getBytes(StandardCharsets.UTF_8)
//         );

//         if (!validSignature) {
//             return "Invalid payment signature";
//         }

//         if (!VNPayConfig.VNPAY_TMN_CODE.equals(params.get("vnp_TmnCode"))) {
//             return "Invalid merchant";
//         }

//         if (!"00".equals(params.get("vnp_ResponseCode"))
//                 || !"00".equals(params.get("vnp_TransactionStatus"))) {
//             return "Payment failed";
//         }

//         Long orderId = Long.parseLong(params.get("vnp_TxnRef"));

//         Order order = orderService.findOrderById(orderId);

//         if (!"PENDING".equalsIgnoreCase(order.getOrderStatus())) {
//             return "Order is not pending";
//         }

//         long vnpAmount = Long.parseLong(params.get("vnp_Amount"));
//         long expectedAmount = (long) order.getTotalDiscountedPrice() * 100;

//         if (vnpAmount != expectedAmount) {
//             return "Invalid payment amount";
//         }

//         orderService.confirmedOrder(orderId);

//         return "Payment successful";
//     }
// }