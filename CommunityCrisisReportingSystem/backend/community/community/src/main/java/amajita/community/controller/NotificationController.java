package amajita.community.controller;

import amajita.community.model.Notification;
import amajita.community.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Notification>> getUserNotifications(@PathVariable Long userId) {
        List<Notification> notifications = notificationService.getNotificationsByUserId(userId);
        return ResponseEntity.ok(notifications);
    }

    @PatchMapping("/{id}/mark-as-read")
    public ResponseEntity<Notification> markAsRead(@PathVariable Long id) {
        Notification notification = notificationService.markNotificationAsRead(id);
        return ResponseEntity.ok(notification);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/unread-count/user/{userId}")
    public ResponseEntity<Long> getUnreadCountForUser(@PathVariable Long userId) {
        long count = notificationService.getUnreadCountForUser(userId);
        return ResponseEntity.ok(count);
    }
}