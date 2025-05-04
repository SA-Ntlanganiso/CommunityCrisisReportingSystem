package amajita.community.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Data
@Entity
@Table(name = "crisis_reports")
public class CrisisReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;
    
    private String description;
    
    @Column(nullable = false)
    private String category;
    
    @Column(nullable = false)
    private String status = "PENDING";
    
    private String severity;
    
    @Column(nullable = false)
    private double latitude;
    
    @Column(nullable = false)
    private double longitude;
    
    private String address;
    
    @Column(name = "reporter_id", nullable = false)
    private Long reporterId;
    
    private String reporterName;
    
    @Column(nullable = false)
    private int responders = 0;
    
    @Column(name = "report_time")
    private LocalDateTime reportTime;

    @ManyToOne
    @JoinColumn(name = "responder_id")
    @JsonIgnore // Add this to prevent circular references
    private User responder;
    // Constructors
    public CrisisReport() {}

    public CrisisReport(String title, String description, String category, 
                      double latitude, double longitude, String address, 
                      Long reporterId, String reporterName) {
        this.title = title;
        this.description = description;
        this.category = category;
        this.latitude = latitude;
        this.longitude = longitude;
        this.address = address;
        this.reporterId = reporterId;
        this.reporterName = reporterName;
    }
      
    public User getResponder() {
        return responder;
    }

    public void setResponder(User responder) {
        this.responder = responder;
    }
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getCategory() {
        return category;
    }
    
    public void setCategory(String category) {
        this.category = category;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public String getSeverity() {
        return severity;
    }
    
    public void setSeverity(String severity) {
        this.severity = severity;
    }
    
    public double getLatitude() {
        return latitude;
    }
    
    public void setLatitude(double latitude) {
        this.latitude = latitude;
    }
    
    public double getLongitude() {
        return longitude;
    }
    
    public void setLongitude(double longitude) {
        this.longitude = longitude;
    }
    
    public String getAddress() {
        return address;
    }
    
    public void setAddress(String address) {
        this.address = address;
    }
    
    public Long getReporterId() {
        return reporterId;
    }
    
    public void setReporterId(Long reporterId) {
        this.reporterId = reporterId;
    }
    
    public String getReporterName() {
        return reporterName;
    }
    
    public void setReporterName(String reporterName) {
        this.reporterName = reporterName;
    }
    
    public int getResponders() {
        return responders;
    }
    
    public void setResponders(int responders) {
        this.responders = responders;
    }
    
    public LocalDateTime getReportTime() {
        return reportTime;
    }
    
    public void setReportTime(LocalDateTime reportTime) {
        this.reportTime = reportTime;
    }
    
}