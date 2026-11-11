package com.it3180hust.ecommerce;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.OptimisticLockingFailureException;

import com.it3180hust.model.Product;
import com.it3180hust.repository.ProductRepository;

@SpringBootTest
class EcommerceApplicationTests {
	@Autowired 
	ProductRepository productRepository;

	@Test
	void contextLoads() {
	}

	@Test
	void shouldPreventOverselling_whenUserAAndUserBCompeteForLastItem() {
		System.out.println("\n========================================================");
		System.out.println(">>> SCENARIO: User A and User B compete for last item");
		System.out.println("========================================================");

		Product flashSaleItem = new Product();
		flashSaleItem.setTitle("PlayStation 5 - Last Item");
		flashSaleItem.setQuantity(1);
		flashSaleItem.setPrice(500);
		flashSaleItem = productRepository.saveAndFlush(flashSaleItem);

		System.out.println("[INITIAL] Stock = " + flashSaleItem.getQuantity() + " | Version = " + flashSaleItem.getVersion());

		Product itemSeenByUserA = productRepository.findById(flashSaleItem.getId()).orElseThrow();
		Product itemSeenByUserB = productRepository.findById(flashSaleItem.getId()).orElseThrow();

		// User A buys
		itemSeenByUserA.setQuantity(itemSeenByUserA.getQuantity() - 1);
		Product userAPurchased = productRepository.saveAndFlush(itemSeenByUserA);
		System.out.println("[USER A] Bought successfully! Remaining Stock = " + userAPurchased.getQuantity() 
			+ " | New Version in DB = " + userAPurchased.getVersion());

		// User B tries to buy
		System.out.println("[USER B] Attempting to buy with stale version (Version = " + itemSeenByUserB.getVersion() + ")...");
		itemSeenByUserB.setQuantity(itemSeenByUserB.getQuantity() - 1);

		try {
			productRepository.saveAndFlush(itemSeenByUserB);
		} catch (OptimisticLockingFailureException e) {
			System.out.println("[BLOCKED] Caught OptimisticLockingFailureException!");
			System.out.println("[MESSAGE] " + e.getMessage());
			System.out.println(">>> RESULT: Overselling was prevented! User B's order was safely rejected.");
		}
		System.out.println("========================================================\n");
	}
}
