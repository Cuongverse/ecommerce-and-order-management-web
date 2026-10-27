package com.it3180hust;

import java.lang.reflect.Constructor;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.it3180hust.model.Category;
import com.it3180hust.model.Product;
import com.it3180hust.model.Size;
import com.it3180hust.model.User;
import com.it3180hust.repository.CategoryRepostiory;
import com.it3180hust.repository.ProductRepository;
import com.it3180hust.repository.UserRepository;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final CategoryRepostiory categoryRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                          ProductRepository productRepository,
                          CategoryRepostiory categoryRepository,
                          PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (productRepository.count() > 0 || userRepository.count() > 0) {
            return;
        }

        Category gaming = createCategory("Gaming", null, 1);
        Category giftCards = createCategory("Gift Cards", gaming, 2);
        Category topUp = createCategory("Top Up", gaming, 2);

        Category pubg = createCategory("PUBG", topUp, 3);
        Category genshin = createCategory("Genshin Impact", topUp, 3);
        Category minecraft = createCategory("Minecraft", giftCards, 3);
        Category steam = createCategory("Steam", giftCards, 3);
        Category valorant = createCategory("Valorant", topUp, 3);
        Category roblox = createCategory("Roblox", giftCards, 3);
        Category playstation = createCategory("PlayStation", giftCards, 3);
        Category xbox = createCategory("Xbox", giftCards, 3);
        Category nintendo = createCategory("Nintendo", giftCards, 3);
        Category freeFire = createCategory("Free Fire", topUp, 3);
        Category mobileLegends = createCategory("Mobile Legends", topUp, 3);

        createUserIfNotExists("admin@giftcard.com", "Admin", "User", "admin123", "ROLE_ADMIN", "0900000001");
        createUserIfNotExists("user@giftcard.com", "Khách", "Hàng", "user123", "ROLE_USER", "0912345678");

        createProductIfNotExists(
                "PUBG Mobile 60 UC",
                "Gói nạp PUBG Mobile 60 UC, nhận ngay trong tài khoản game.",
                pubg,
                180000,
                150000,
                17,
                "PUBG",
                "Gold",
                "https://images.unsplash.com/photo-1542751371-adc38448a05e",
                200
        );

        createProductIfNotExists(
                "PUBG Mobile 325 UC",
                "Gói nạp PUBG Mobile 325 UC phù hợp cho các event và skin ưu tiên.",
                pubg,
                760000,
                650000,
                15,
                "PUBG",
                "Gold",
                "https://images.unsplash.com/photo-1511512578047-dfb367046420",
                180
        );

        createProductIfNotExists(
                "Genshin Impact 300 Genesis Crystals",
                "Gói nạp Genshin Impact phục vụ mua vật phẩm, thẻ kỹ năng và các vật dụng trong game.",
                genshin,
                180000,
                160000,
                11,
                "Genshin Impact",
                "Blue",
                "https://images.unsplash.com/photo-1542751371-adc38448a05e",
                220
        );

        createProductIfNotExists(
                "Genshin Impact 980 Genesis Crystals",
                "Gói nạp Genshin Impact 980 Genesis Crystals, ưu đãi tốt cho người chơi lâu năm.",
                genshin,
                520000,
                470000,
                10,
                "Genshin Impact",
                "Sky Blue",
                "https://images.unsplash.com/photo-1511512578047-dfb367046420",
                170
        );

        createProductIfNotExists(
                "Minecraft Java Edition Gift Code",
                "Gift code Minecraft Java Edition cho bạn tải game, mở khóa trải nghiệm và bản đồ độc đáo.",
                minecraft,
                390000,
                349000,
                10,
                "Minecraft",
                "Green",
                "https://images.unsplash.com/photo-1511512578047-dfb367046420",
                150
        );

        createProductIfNotExists(
                "Minecraft Dungeons Gift Card",
                "Thẻ quà tặng Minecraft Dungeons với mã kích hoạt nhanh chóng.",
                minecraft,
                280000,
                249000,
                11,
                "Minecraft",
                "Dark Green",
                "https://images.unsplash.com/photo-1511512578047-dfb367046420",
                120
        );

        createProductIfNotExists(
                "Steam Wallet $20 Gift Card",
                "Thẻ Steam Wallet giá trị 20 USD, dùng mua game, DLC và ứng dụng tại Steam.",
                steam,
                540000,
                499000,
                8,
                "Steam",
                "Gray",
                "https://images.unsplash.com/photo-1511512578047-dfb367046420",
                200
        );

        createProductIfNotExists(
                "Valorant 420 VP",
                "Gói nạp Valorant 420 VP, dùng cho mua skin, bundle và cosmetics trong game.",
                valorant,
                150000,
                135000,
                10,
                "Valorant",
                "Red",
                "https://images.unsplash.com/photo-1542751371-adc38448a05e",
                180
        );

        createProductIfNotExists(
                "Valorant 1375 VP",
                "Gói nạp Valorant 1375 VP với ưu đãi hợp lý cho game thủ chuyên nghiệp.",
                valorant,
                450000,
                410000,
                9,
                "Valorant",
                "Crimson",
                "https://images.unsplash.com/photo-1511512578047-dfb367046420",
                130
        );

        createProductIfNotExists(
                "Roblox Gift Card 200 Robux",
                "Thẻ quà tặng Roblox cho phép nạp Robux nhanh chóng để mua avatar, item và game.",
                roblox,
                190000,
                170000,
                11,
                "Roblox",
                "Black",
                "https://images.unsplash.com/photo-1521572267360-ee0c2909d518",
                100
        );

        createProductIfNotExists(
                "PlayStation Store $25 Gift Card",
                "Gift card PlayStation Store 25 USD để mua game, DLC và các nội dung trên PSN.",
                playstation,
                680000,
                620000,
                9,
                "PlayStation",
                "Blue",
                "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77",
                95
        );

        createProductIfNotExists(
                "Xbox Live $15 Gift Card",
                "Mã thẻ Xbox Live 15 USD dùng để mua game, DLC và đồ dùng trên nền tảng Xbox.",
                xbox,
                420000,
                390000,
                7,
                "Xbox",
                "Green",
                "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77",
                90
        );

        createProductIfNotExists(
                "Nintendo eShop $20 Gift Card",
                "Gift card Nintendo eShop 20 USD cho người dùng Nintendo Switch yêu thích game chạy trên eShop.",
                nintendo,
                520000,
                490000,
                6,
                "Nintendo",
                "Red",
                "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77",
                80
        );

        createProductIfNotExists(
                "Free Fire 100 Diamonds",
                "Gói nạp Free Fire 100 Diamonds, tiện dụng cho việc mở skin và vật phẩm trong game.",
                freeFire,
                220000,
                190000,
                14,
                "Free Fire",
                "Orange",
                "https://images.unsplash.com/photo-1521572267360-ee0c2909d518",
                150
        );

        createProductIfNotExists(
                "Mobile Legends 28 Diamonds",
                "Gói nạp Mobile Legends 28 Diamonds nhanh chóng để mua skin và vật phẩm trong game.",
                mobileLegends,
                120000,
                99000,
                18,
                "Mobile Legends",
                "Purple",
                "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
                180
        );
    }

    private Category createCategory(String name, Category parent, int level) {
        Category existing = (parent == null)
                ? categoryRepository.findByName(name)
                : categoryRepository.findByNameAndParent(name, parent.getName());

        if (existing != null) {
            return existing;
        }

        Category category = new Category();
        category.setName(name);
        category.setParentCategory(parent);
        category.setLevel(level);
        return categoryRepository.save(category);
    }

    private User createUserIfNotExists(String email, String firstName, String lastName,
                                       String rawPassword, String role, String mobile) {
        User existingUser = userRepository.findByEmail(email);
        if (existingUser != null) {
            return existingUser;
        }

        User user = new User();
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setRole(role);
        user.setMobile(mobile);
        user.setCreatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    private Product createProductIfNotExists(String title,
                                            String description,
                                            Category category,
                                            int price,
                                            int discountedPrice,
                                            double discountedPercent,
                                            String brand,
                                            String color,
                                            String imageUrl,
                                            int quantity) {

        boolean exists = productRepository.findAll()
                .stream()
                .anyMatch(product -> product.getTitle().equalsIgnoreCase(title));

        if (exists) {
            return null;
        }

        Product product = new Product();
        product.setTitle(title);
        product.setDescription(description);
        product.setPrice(price);
        product.setDiscountedPrice(discountedPrice);
        product.setDiscountedPercent(discountedPercent);
        product.setBrand(brand);
        product.setColor(color);
        product.setImageUrl(imageUrl);
        product.setQuantity(quantity);
        product.setCategory(category);
        product.setCreatedAt(LocalDateTime.now());
        product.setSizes(buildSizes(quantity));
        product.setNumRatings(0);

        return productRepository.save(product);
    }

    private Set<Size> buildSizes(int totalQuantity) {
        Set<Size> sizes = new HashSet<>();

        sizes.add(createSize("S", Math.max(1, totalQuantity / 3)));
        sizes.add(createSize("M", Math.max(1, totalQuantity / 3)));
        sizes.add(createSize("L", Math.max(1, totalQuantity / 3)));

        return sizes;
    }

    private Size createSize(String name, int quantity) {
        try {
            Constructor<Size> constructor = Size.class.getDeclaredConstructor();
            constructor.setAccessible(true);
            Size size = constructor.newInstance();
            size.setName(name);
            size.setQuantity(quantity);
            return size;
        } catch (Exception e) {
            throw new RuntimeException("Failed to create sample size: " + name, e);
        }
    }
}
