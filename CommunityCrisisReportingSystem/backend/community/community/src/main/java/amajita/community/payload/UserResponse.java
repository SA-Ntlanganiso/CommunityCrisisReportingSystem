package amajita.community.payload;

import amajita.community.model.UserRole;
import lombok.Data;

@Data
public class UserResponse {
    private Long id;
    private String email;
    private UserRole role;
    
    public UserResponse(Long id, String email, UserRole role) {
        this.id = id;
        this.email = email;
        this.role = role;
    }
}
