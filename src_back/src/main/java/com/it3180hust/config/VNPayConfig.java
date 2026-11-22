package com.it3180hust.config;

import org.springframework.stereotype.Component;

@Component
public class VNPayConfig {

    public static final String VNPAY_URL =
            "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";

    public static final String VNPAY_TMN_CODE = "YOUR_TMN_CODE";

    public static final String VNPAY_HASH_SECRET = "YOUR_HASH_SECRET";

    public static final String VNPAY_VERSION = "2.1.0";

    public static final String VNPAY_COMMAND = "pay";

    public static final String VNPAY_CURRENCY = "VND";

    public static final String VNPAY_LOCALE = "vn";

    public static final String VNPAY_RETURN_URL =
            "http://localhost:5432/api/payment/vnpay-callback";
}
