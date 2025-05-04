package amajita.community.controller;

import amajita.community.model.CrisisReport;
import amajita.community.service.CrisisReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/crisis-reports")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8281"})
public class CrisisReportController {

    private final CrisisReportService crisisReportService;
    private static final Long DEFAULT_REPORTER_ID = 1L;

    @Autowired
    public CrisisReportController(CrisisReportService crisisReportService) {
        this.crisisReportService = crisisReportService;
    }

    @GetMapping
    public List<CrisisReport> getAllReports() {
        return crisisReportService.getAllReports();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CrisisReport> getReportById(@PathVariable Long id) {
        return crisisReportService.getReportById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/resolve")
    public ResponseEntity<CrisisReport> resolveCrisis(@PathVariable Long id) {
        CrisisReport resolvedCrisis = crisisReportService.resolveCrisis(id);
        return ResponseEntity.ok(resolvedCrisis);
    }

    @PostMapping
    public ResponseEntity<?> createReport(@RequestBody CrisisReport crisisReport) {
        try {
            if (crisisReport.getTitle() == null || crisisReport.getTitle().trim().isEmpty()) {
                return errorResponse("Title is required");
            }
            
            crisisReport.setReportTime(LocalDateTime.now());
            crisisReport.setResponders(0);
            
            if (crisisReport.getReporterId() == null) {
                crisisReport.setReporterId(DEFAULT_REPORTER_ID);
            }
            
            CrisisReport savedReport = crisisReportService.saveReport(crisisReport);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedReport);
            
        } catch (DataIntegrityViolationException e) {
            return errorResponse("Database constraint violation: " + e.getMessage());
        } catch (Exception e) {
            return errorResponse("Internal server error: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReport(@PathVariable Long id) {
        if (crisisReportService.getReportById(id).isPresent()) {
            crisisReportService.deleteCrisis(id); // Changed to call deleteCrisis
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    private ResponseEntity<Map<String, String>> errorResponse(String message) {
        Map<String, String> response = new HashMap<>();
        response.put("error", message);
        return ResponseEntity.badRequest().body(response);
    }
    
    @GetMapping("/responder/{responderId}")
    public ResponseEntity<List<CrisisReport>> getCrisesByResponder(@PathVariable Long responderId) {
        List<CrisisReport> crises = crisisReportService.getCrisesByResponder(responderId);
        return ResponseEntity.ok(crises);
    }

    @PatchMapping("/{id}/assign/{responderId}")
    public ResponseEntity<CrisisReport> assignResponder(
            @PathVariable Long id,
            @PathVariable Long responderId) {
        CrisisReport updated = crisisReportService.assignCrisisToResponder(id, responderId);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<CrisisReport> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> statusUpdate) {
        CrisisReport updated = crisisReportService.updateStatus(id, statusUpdate.get("status"));
        return ResponseEntity.ok(updated);
    }
}