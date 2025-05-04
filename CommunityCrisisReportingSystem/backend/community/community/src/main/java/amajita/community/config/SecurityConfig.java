package amajita.community.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import amajita.community.security.CustomUserDetailsService;
import amajita.community.security.JwtAuthenticationFilter;
import amajita.community.security.JwtTokenProvider;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    private final JwtTokenProvider jwtTokenProvider;
    private final CustomUserDetailsService customUserDetailsService;

    public SecurityConfig(JwtTokenProvider jwtTokenProvider, 
                        CustomUserDetailsService customUserDetailsService) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.customUserDetailsService = customUserDetailsService;
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers(
                    "/api/auth/**",
                    "/api/users/signup"
                ).permitAll()
                
                // Crisis reports - authenticated users can create, but need specific roles for management
                .requestMatchers(HttpMethod.POST, "/api/crisis-reports").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/crisis-reports").authenticated()
                .requestMatchers("/api/crisis-reports/**").authenticated()
                
                // User management (Admin only)
                .requestMatchers("/api/users/**").hasRole("ADMIN")
                
                // Notification endpoints
                .requestMatchers("/api/notifications/**").authenticated()
                
                // Responder-specific endpoints
                .requestMatchers("/api/responder/**").hasRole("RESPONDER")
                .requestMatchers("/api/crisis-reports/responder/**").hasRole("RESPONDER")
                
                // All other requests require authentication
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
    
    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(jwtTokenProvider, customUserDetailsService);
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:3000", 
            "http://localhost:8281",
            "http://192.168.150.33:3000" 
        ));
        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"
        ));
        configuration.setAllowedHeaders(Arrays.asList(
            "Authorization", 
            "Cache-Control", 
            "Content-Type",
            "X-Requested-With",
            "Accept"
        ));
        configuration.setExposedHeaders(Arrays.asList(
            "Authorization", 
            "Content-Disposition",
            "X-Total-Count"
        ));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}