package com.it3180hust.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.it3180hust.response.AnalyticsSummaryResponse;
import com.it3180hust.response.MonthlyRevenueResponse;
import com.it3180hust.response.TopSellingProductResponse;
import com.it3180hust.service.AdminAnalyticsService;

@RestController
@RequestMapping("/api/admin/analytics")
public class AdminAnalyticsController {
    private final AdminAnalyticsService analyticsService;

    public AdminAnalyticsController(AdminAnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/summary")
    public ResponseEntity<AnalyticsSummaryResponse> getSummary() {
        return ResponseEntity.ok(analyticsService.getSummary());
    }

    @GetMapping("/top-selling")
    public ResponseEntity<List<TopSellingProductResponse>> getTopSellingProducts() {
        return ResponseEntity.ok(analyticsService.getTopSellingProducts());
    }

    @GetMapping("/revenue-by-month")
    public ResponseEntity<List<MonthlyRevenueResponse>> getRevenueByMonth() {
        return ResponseEntity.ok(analyticsService.getRevenueByMonth());
    }
}
