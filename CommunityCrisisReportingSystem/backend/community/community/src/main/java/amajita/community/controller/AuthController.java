package amajita.community.controller;

import amajita.community.model.User;
import amajita.community.payload.LoginRequest;
import amajita.community.repository.UserRepository;
import amajita.community.security.JwtAuthenticationResponse;
import amajita.community.security.JwtTokenProvider;

import java.util.Collections;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "http://localhost:3000") // Add this line
@RequestMapping("/api/auth")
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;

    public AuthController(AuthenticationManager authenticationManager,
                        JwtTokenProvider tokenProvider,
                        UserRepository userRepository) {
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.userRepository = userRepository;
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        logger.info("Login attempt for email: {}", loginRequest.getEmail());
        System.out.println("Received login request for: " + loginRequest.getEmail());
        System.out.println("Password length: " + loginRequest.getPassword().length());
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.getEmail(),
                    loginRequest.getPassword()
                )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            // Get the authenticated email
            String email = authentication.getName();
            logger.info("Authentication successful for email: {}", email);
            
            // Fetch the complete user from repository
            User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    logger.error("User not found in database after authentication: {}", email);
                    return new UsernameNotFoundException("User not found");
                });
            
            String jwt = tokenProvider.generateToken(user);
            logger.info("JWT token generated for user: {}", user.getEmail());
            
            return ResponseEntity.ok(new JwtAuthenticationResponse(
                jwt,
                user.getId(),
                user.getEmail(),
                user.getRole().name()
            ));
            
        } catch (BadCredentialsException e) {
            logger.error("Invalid credentials for email: {}", loginRequest.getEmail());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                   .body(Collections.singletonMap("error", "Invalid email or password"));
        } catch (Exception e) {
            logger.error("Login error for email {}: {}", loginRequest.getEmail(), e.getMessage());
            return ResponseEntity.badRequest()
                   .body(Collections.singletonMap("error", "Login failed: " + e.getMessage()));
        }
    }
    
}
