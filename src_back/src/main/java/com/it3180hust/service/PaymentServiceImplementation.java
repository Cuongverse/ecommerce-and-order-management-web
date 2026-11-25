
package com.it3180hust.service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.TreeMap;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.stereotype.Service;

import com.it3180hust.config.VNPayConfig;
import com.it3180hust.model.Order;

@Service
public class PaymentServiceImplementation implements PaymentService {

    private final OrderService orderService;

    public PaymentServiceImplementation(OrderService orderService) {
        this.orderService = orderService;
    }

    @Override
    public String createPaymentUrl(Long orderId, String ipAddress) throws Exception {

        Order order = orderService.findOrderById(orderId);

        if (!"PENDING".equalsIgnoreCase(order.getOrderStatus())) {
            throw new Exception("Order is not pending");
        }

        long amount = (long) order.getTotalDiscountedPrice() * 100;

        DateTimeFormatter formatter =
                DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

        String createDate = LocalDateTime.now().format(formatter);

        Map<String, String> params = new TreeMap<>();

        params.put("vnp_Version", VNPayConfig.VNPAY_VERSION);
        params.put("vnp_Command", VNPayConfig.VNPAY_COMMAND);
        params.put("vnp_TmnCode", VNPayConfig.VNPAY_TMN_CODE);
        params.put("vnp_Amount", String.valueOf(amount));
        params.put("vnp_CurrCode", VNPayConfig.VNPAY_CURRENCY);
        params.put("vnp_TxnRef", String.valueOf(order.getId()));
        params.put("vnp_OrderInfo", "Thanh toan don hang " + order.getId());
        params.put("vnp_OrderType", "other");
        params.put("vnp_Locale", VNPayConfig.VNPAY_LOCALE);
        params.put("vnp_ReturnUrl", VNPayConfig.VNPAY_RETURN_URL);
        params.put("vnp_IpAddr", ipAddress);
        params.put("vnp_CreateDate", createDate);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();

        for (Map.Entry<String, String> entry : params.entrySet()) {

            String encodedKey = URLEncoder.encode(
                    entry.getKey(), StandardCharsets.UTF_8);

            String encodedValue = URLEncoder.encode(
                    entry.getValue(), StandardCharsets.UTF_8);

            if (hashData.length() > 0) {
                hashData.append("&");
                query.append("&");
            }

            hashData.append(encodedKey).append("=").append(encodedValue);
            query.append(encodedKey).append("=").append(encodedValue);
        }

        Mac hmac = Mac.getInstance("HmacSHA512");

        SecretKeySpec secretKey = new SecretKeySpec(
                VNPayConfig.VNPAY_HASH_SECRET.getBytes(StandardCharsets.UTF_8),
                "HmacSHA512"
        );

        hmac.init(secretKey);

        byte[] hash = hmac.doFinal(
                hashData.toString().getBytes(StandardCharsets.UTF_8));

        StringBuilder secureHash = new StringBuilder();

        for (byte b : hash) {
            secureHash.append(String.format("%02x", b));
        }

        query.append("&vnp_SecureHash=").append(secureHash);

        return VNPayConfig.VNPAY_URL + "?" + query;
    }
}
