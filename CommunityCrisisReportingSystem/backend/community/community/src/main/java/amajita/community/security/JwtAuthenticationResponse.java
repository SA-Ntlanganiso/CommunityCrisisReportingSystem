package amajita.community.security;

import lombok.Data;

@Data
public class JwtAuthenticationResponse {
    private String accessToken;
    private String tokenType = "Bearer";
    private Long id;
    private String email;
    private String role;

    public JwtAuthenticationResponse(String accessToken, Long id, String email, String role) {
        this.accessToken = accessToken;
        this.id = id;
        this.email = email;
        this.role = role;
    }
}