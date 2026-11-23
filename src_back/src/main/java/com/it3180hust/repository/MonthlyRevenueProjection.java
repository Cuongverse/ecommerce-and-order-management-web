package com.it3180hust.repository;

public interface MonthlyRevenueProjection {
    Integer getYear();

    Integer getMonth();

    Long getRevenue();
}
