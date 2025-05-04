package amajita.community.repository;

import amajita.community.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    // Get all notifications ordered by sent date (newest first)
    List<Notification> findAllByOrderBySentAtDesc();
    
    // Count all unread notifications
    long countByIsReadFalse();
    
    // Find notification by ID (for update operations)
    // Inherited from JpaRepository
    
    // User-specific notifications
    List<Notification> findByUserIdOrderBySentAtDesc(Long userId);
    
    // Count unread notifications for specific user
    long countByUserIdAndIsReadFalse(Long userId);
    
    // Bulk mark as read (alternative implementation)
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.id IN :ids")
    void markNotificationsAsRead(@Param("ids") List<Long> ids);
}