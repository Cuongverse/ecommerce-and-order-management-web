package com.it3180hust.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.it3180hust.repository.MonthlyRevenueProjection;
import com.it3180hust.repository.OrderItemRepository;
import com.it3180hust.repository.OrderRepository;
import com.it3180hust.repository.TopSellingProductProjection;
import com.it3180hust.repository.UserRepository;
import com.it3180hust.response.AnalyticsSummaryResponse;
import com.it3180hust.response.MonthlyRevenueResponse;
import com.it3180hust.response.TopSellingProductResponse;

@Service
public class AdminAnalyticsService {
    private static final int REVENUE_MONTH_COUNT = 12;

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final UserRepository userRepository;

    public AdminAnalyticsService(OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.userRepository = userRepository;
    }

    public AnalyticsSummaryResponse getSummary() {
        return new AnalyticsSummaryResponse(
                orderRepository.sumDiscountedRevenueByStatus("DELIVERED"),
                orderRepository.countByOrderStatus("DELIVERED"),
                orderRepository.countByOrderStatus("CANCELLED"),
                userRepository.countByRole("ROLE_USER"));
    }

    public List<TopSellingProductResponse> getTopSellingProducts() {
        return orderItemRepository.findTopSellingDeliveredProducts(PageRequest.of(0, 5))
                .stream()
                .map(this::toTopSellingProductResponse)
                .toList();
    }

    public List<MonthlyRevenueResponse> getRevenueByMonth() {
        YearMonth currentMonth = YearMonth.from(LocalDate.now());
        YearMonth firstMonth = currentMonth.minusMonths(REVENUE_MONTH_COUNT - 1);
        LocalDateTime from = firstMonth.atDay(1).atStartOfDay();
        LocalDateTime to = currentMonth.plusMonths(1).atDay(1).atStartOfDay();

        Map<YearMonth, Long> revenueByMonth = new HashMap<>();
        for (MonthlyRevenueProjection row : orderRepository.findDeliveredRevenueByMonth(from, to)) {
            YearMonth month = YearMonth.of(row.getYear(), row.getMonth());
            revenueByMonth.put(month, row.getRevenue());
        }

        return java.util.stream.IntStream.range(0, REVENUE_MONTH_COUNT)
                .mapToObj(firstMonth::plusMonths)
                .map(month -> new MonthlyRevenueResponse(month.toString(), revenueByMonth.getOrDefault(month, 0L)))
                .toList();
    }

    private TopSellingProductResponse toTopSellingProductResponse(TopSellingProductProjection product) {
        return new TopSellingProductResponse(
                product.getProductId(),
                product.getProductTitle(),
                product.getQuantitySold());
    }
}
