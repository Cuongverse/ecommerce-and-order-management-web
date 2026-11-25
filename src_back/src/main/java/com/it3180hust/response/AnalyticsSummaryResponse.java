package com.it3180hust.response;

public record AnalyticsSummaryResponse(
        long totalRevenue,
        long successfulOrders,
        long cancelledOrders,
        long totalCustomers) {
}
