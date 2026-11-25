
package com.it3180hust.service;

public interface PaymentService {

    String createPaymentUrl(Long orderId, String ipAddress) throws Exception;

}
