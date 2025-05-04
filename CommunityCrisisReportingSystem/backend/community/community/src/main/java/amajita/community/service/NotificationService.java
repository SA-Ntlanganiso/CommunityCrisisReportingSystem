package amajita.community.service;

import amajita.community.model.CrisisReport;
import amajita.community.model.Notification;
import amajita.community.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Autowired
    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public Notification createResolutionNotification(CrisisReport crisis) {
        Notification notification = new Notification();
        notification.setMessage("Your crisis report '" + crisis.getTitle() + "' has been resolved.");
        notification.setChannel("EMAIL");
        notification.setUserId(crisis.getReporterId());
        notification.setCrisisId(crisis.getId());
        notification.setSentAt(LocalDateTime.now());
        return notificationRepository.save(notification);
    }

    public Notification createDeletionNotification(CrisisReport crisis) {
        Notification notification = new Notification();
        notification.setMessage("Your crisis report '" + crisis.getTitle() + "' has been deleted by an admin.");
        notification.setChannel("EMAIL");
        notification.setUserId(crisis.getReporterId());
        notification.setCrisisId(crisis.getId());
        notification.setSentAt(LocalDateTime.now());
        return notificationRepository.save(notification);
    }

    public List<Notification> getNotificationsByUserId(Long userId) {
        return notificationRepository.findByUserIdOrderBySentAtDesc(userId);
    }

    public Notification markNotificationAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    public void deleteNotification(Long id) {
        notificationRepository.deleteById(id);
    }
    public long getUnreadCountForUser(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }
    // Add other notification methods as needed
}