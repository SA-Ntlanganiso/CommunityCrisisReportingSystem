package amajita.community.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "first_name", length = 100)
    private String firstName;

    @Column(name = "last_name", length = 100)
    private String lastName;

    @NotBlank
    @Size(max = 255)
    @Email
    private String email;

    @Column(length = 20)
    private String phone;

    @NotBlank
    @Size(max = 255)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private UserRole role;

    private boolean active = true;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // Add these additional getters if not using Lombok @Data
    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public UserRole getRole() {
        return role;
    }

    public String getPassword() {
        return password;
    }

    public boolean isActive() {
        return active;
    }
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }
    
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
    
    public void setRole(UserRole role) {
        this.role = role;
    }
    
    public void setActive(boolean active) {
        this.active = active;
    }
    
}