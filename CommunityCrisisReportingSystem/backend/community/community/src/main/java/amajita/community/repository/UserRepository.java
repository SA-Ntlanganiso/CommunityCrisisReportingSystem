// src/main/java/amajita/community/repository/UserRepository.java
package amajita.community.repository;

import amajita.community.model.User;
import amajita.community.model.UserRole;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Boolean existsByEmail(String email);
     List<User> findByRole(UserRole role);
}