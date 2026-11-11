package com.it3180hust.config;

import java.util.Date;
import java.util.stream.Collectors;

import javax.crypto.SecretKey;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

/**
 * Class này sinh và giải mã JWT (JSON Web Token)
 */
@Service 
public class JwtProvider{
    /** key lấy được bằng thuật toán HMAC-SHA đổi từ SCECRET_KEY sang dạng Byte */
    SecretKey key = Keys.hmacShaKeyFor(JwtConstant.SECRET_KEY.getBytes());

    /** Tạo token khi người dùng đăng nhập thành công */
    public String generateToken(Authentication auth){
        @SuppressWarnings("null")
                            // lấy ra danh sách các quyền (ROLE_CUSTOMER, ROLE_ADMIN)
        String authorities = auth.getAuthorities().stream()
                            .map(GrantedAuthority::getAuthority)
                            // nối các quyền thành một chuỗi duy nhất ngăn cách bằng dấu phẩy
                            // VD: ROLE_CUSTOMER,ROLE_ADMIN
                            .collect(Collectors.joining(","));
        
                            
                    // sử dụng thư viện jjwt để tạo chuỗi token
        String jwt = Jwts.builder()
                    // lưu thời điểm tạo token (ngày giờ hiện tại)
                    .setIssuedAt(new Date())
                    // cho thời điểm hết hạn token + thêm 846,000,000 mili giây ~ 9.8 ngày
                    .setExpiration(new Date(new Date().getTime() + 846000000))
                    // nhúng thông tin 'email' vào phần thân (payload) của token
                    .claim("email", auth.getName())
                    // nhúng chuỗi các quyền (roles) vào Payload
                    .claim("authorities", authorities)
                    // ký điện tử lên token bằng khóa 'key' đảm bảo cho dữ liệu không bị thay đổi giữa chừng
                    .signWith(key).
                    // đóng gói và trả về chuỗi JWT hoàn chỉnh dạng 3 phần nối nhau bằng dấu chấm:
                    // header.payload.signature
                    compact();

        return jwt;
    }

    /** Trích xuất Email từ Token */
    public String getEmailFromToken(String jwt){
        // loại bỏ chuỗi "Bearer " từ jwt lấy được
        jwt = jwt.substring(7);

        Claims claims = Jwts.parserBuilder()
                        // đối chiếu kiểm tra chữ ký xem token có bị chỉnh sửa hay không
                        // thư viện sẽ tự động ném ra ngoại lệ (ExpiredJwtException, SignatureException,...)
                        .setSigningKey(key)
                        .build()
                        .parseClaimsJws(jwt)
                        // trả về đối tượng claims
                        .getBody();

        String email = String.valueOf(claims.get("email"));

        return email;
    }
}
