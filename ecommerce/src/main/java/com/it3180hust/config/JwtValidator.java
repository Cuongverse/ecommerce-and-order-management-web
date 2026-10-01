package com.it3180hust.config;

import java.io.IOException;
import java.util.List;

import javax.crypto.SecretKey;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

// đảm bảo bộ lọc thực hiện duy nhất một lần cho mỗi request gưi tới server
public class JwtValidator extends OncePerRequestFilter{

    // request: chứa dữ liệu gửi lên từ client
    // response: dữ liệu trả về client
    // filterChain: chuỗi các bộ lọc của Spring Security
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
    throws ServletException, IOException {
        // lấy giá trị chuỗi token từ Header của request --> là "Authorization"
        String jwt = request.getHeader(JwtConstant.JWT_HEADER);
        
        if (jwt != null){
            // cắt bỏ tiền tố "Bearer " để lấy chuỗi mã JWT thuần
            jwt = jwt.substring(7);  // 
            try{
                // tạo khóa bí mật dùng HMAC-SHA
                SecretKey key = Keys.hmacShaKeyFor(JwtConstant.SECRET_KEY.getBytes());
                
                // dùng thư viện JJWT để xác minh SigningKey bằng "key"
                // kiểm tra tính toàn vẹn và hạn sử dụng của token
                // lấy đối tượng Claims (chứa thông tin/payload lưu trong token)
                Claims claims = Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(jwt).getBody();

                String email = String.valueOf(claims.get("email"));
                
                // lấy danh sách quyền hạn/vai trò
                String authorities = String.valueOf(claims.get("authorities"));

                List<GrantedAuthority> auths = AuthorityUtils.commaSeparatedStringToAuthorityList(authorities);
                Authentication authentication = new UsernamePasswordAuthenticationToken(email, null, auths);

                // lưu đối tượng authentication vào SecurityContext
                SecurityContextHolder.getContext().setAuthentication(authentication);

            } catch (Exception e){
                throw new BadCredentialsException("invalid token... from jwt validator");
            }
        }

        filterChain.doFilter(request, response);

    }
}