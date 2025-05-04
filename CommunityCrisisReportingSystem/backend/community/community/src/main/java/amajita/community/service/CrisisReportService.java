package amajita.community.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import amajita.community.model.CrisisReport;
import amajita.community.model.User;
import amajita.community.model.UserRole;
import amajita.community.repository.CrisisReportRepository;
import amajita.community.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
@Slf4j
@Service
public class CrisisReportService {

    private final CrisisReportRepository crisisReportRepository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;
    @Autowired
    public CrisisReportService(CrisisReportRepository crisisReportRepository,
                             NotificationService notificationService,
                             UserRepository userRepository) {
        this.crisisReportRepository = crisisReportRepository;
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    @Transactional
    public CrisisReport resolveCrisis(Long id) {
        CrisisReport crisis = crisisReportRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Crisis not found"));
        
        crisis.setStatus("RESOLVED");
        CrisisReport resolvedCrisis = crisisReportRepository.save(crisis);
        
        // Create resolution notification
        notificationService.createResolutionNotification(resolvedCrisis);
        
        return resolvedCrisis;
    }

    public List<CrisisReport> getAllReports() {
        try {
            return crisisReportRepository.findAll()
                .stream()
                .map(this::transformCrisisReport)
                .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching crisis reports", e);
            throw new RuntimeException("Failed to fetch crisis reports", e);
        }
    }

    private CrisisReport transformCrisisReport(CrisisReport crisis) {
        // Standardize status values for frontend
        if ("ACTIVE".equals(crisis.getStatus())) {
            crisis.setStatus("UNRESOLVED");
        } else if ("PENDING".equals(crisis.getStatus())) {
            crisis.setStatus("UNRESOLVED");
        }
        return crisis;
    }
    public Optional<CrisisReport> getReportById(Long id) {
        return crisisReportRepository.findById(id);
    }

    public CrisisReport saveReport(CrisisReport crisisReport) {
        return crisisReportRepository.save(crisisReport);
    }

    @Transactional
    public void deleteCrisis(Long id) {
        CrisisReport crisis = crisisReportRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Crisis not found"));
        
        // Create deletion notification before deleting
        notificationService.createDeletionNotification(crisis);
        
        crisisReportRepository.deleteById(id);
    }
    public List<CrisisReport> getCrisesByResponder(Long responderId) {
        return crisisReportRepository.findByResponderId(responderId);
    }

    public List<CrisisReport> getCrisesAssignedToResponder(Long responderId) {
        return crisisReportRepository.findByResponderIdAndStatusNot(responderId, "RESOLVED");
    }

    @Transactional
    public CrisisReport assignCrisisToResponder(Long crisisId, Long responderId) {
        CrisisReport crisis = crisisReportRepository.findById(crisisId)
            .orElseThrow(() -> new RuntimeException("Crisis not found"));
            
        User responder = userRepository.findById(responderId)
            .orElseThrow(() -> new RuntimeException("Responder not found"));
            
        if (responder.getRole() != UserRole.RESPONDER) {
            throw new RuntimeException("Only RESPONDER users can be assigned to crises");
        }
        
        crisis.setResponder(responder);
        crisis.setStatus("ASSIGNED");
        return crisisReportRepository.save(crisis);
    }

    @Transactional
    public CrisisReport updateStatus(Long id, String status) {
        CrisisReport crisis = crisisReportRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Crisis not found"));
            
        crisis.setStatus(status);
        
        if (status.equals("RESOLVED")) {
            notificationService.createResolutionNotification(crisis);
        }
        
        return crisisReportRepository.save(crisis);
    }
}