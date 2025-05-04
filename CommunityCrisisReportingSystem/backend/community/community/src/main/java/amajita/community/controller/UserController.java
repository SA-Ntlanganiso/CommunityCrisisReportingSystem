package amajita.community.controller;

import amajita.community.exception.EmailAlreadyExistsException;
import amajita.community.exception.InvalidRoleException;
import amajita.community.model.User;
import amajita.community.payload.SignupRequest;
import amajita.community.payload.UserResponse;
import amajita.community.repository.UserRepository;
import amajita.community.service.UserService;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/users")
public class UserController {
    
    private final UserService userService;
    private final UserRepository userRepository;
    
    public UserController(UserService userService, UserRepository userRepository) {
        this.userService = userService;
        this.userRepository = userRepository;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody SignupRequest signupRequest) {
        try {
            UserResponse response = userService.registerUser(signupRequest);
            return ResponseEntity.ok(response);
        } catch (EmailAlreadyExistsException e) {
            return ResponseEntity.status(409).body(e.getMessage());
        } catch (InvalidRoleException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Registration failed: " + e.getMessage());
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setFirstName(userDetails.getFirstName());
                    user.setLastName(userDetails.getLastName());
                    user.setEmail(userDetails.getEmail());
                    user.setRole(userDetails.getRole());
                    User updatedUser = userRepository.save(user);
                    return ResponseEntity.ok(updatedUser);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> toggleUserStatus(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setActive(!user.isActive());
                    User updatedUser = userRepository.save(user);
                    return ResponseEntity.ok(updatedUser);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}