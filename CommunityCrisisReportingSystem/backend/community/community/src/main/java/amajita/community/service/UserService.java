package amajita.community.service;

import amajita.community.exception.EmailAlreadyExistsException;
import amajita.community.exception.InvalidRoleException;
import amajita.community.model.User;
import amajita.community.model.UserRole;
import amajita.community.payload.SignupRequest;
import amajita.community.payload.UserResponse;
import amajita.community.repository.UserRepository;
import amajita.community.security.JwtTokenProvider;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder,JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    public UserResponse registerUser(SignupRequest signupRequest) {
        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            throw new EmailAlreadyExistsException("Email is already in use!");
        }

        UserRole role;
        try {
            role = UserRole.valueOf(signupRequest.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new InvalidRoleException("Invalid role specified");
        }

        // Split name into first and last names
        String[] names = signupRequest.getName().trim().split(" ", 2);
        String firstName = names[0];
        String lastName = names.length > 1 ? names[1] : "";

        User user = new User();
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEmail(signupRequest.getEmail().trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
        user.setRole(role);
        user.setActive(true);

        User savedUser = userRepository.save(user);
        
        return new UserResponse(
            savedUser.getId(),
            savedUser.getEmail(),
            savedUser.getRole()
        );
    }
   
    public User getUserFromToken(String token) {
        Long userId = jwtTokenProvider.getUserIdFromJWT(token.replace("Bearer ", ""));
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<User> getAllResponders() {
        return userRepository.findByRole(UserRole.RESPONDER);
    }
}