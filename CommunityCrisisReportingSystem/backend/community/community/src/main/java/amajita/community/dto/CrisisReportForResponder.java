package amajita.community.dto;

import java.time.LocalDateTime;

import amajita.community.model.CrisisReport;
import lombok.Data;
@Data
public class CrisisReportForResponder {
    
private Long id;
    private String title;
    private String description;
    private String status;
    private String category;
    private String reporterName;
    private LocalDateTime reportTime;
    private String address;
    
    // Constructor from CrisisReport entity
    public CrisisReportForResponder(CrisisReport crisis) {
        this.id = crisis.getId();
        this.title = crisis.getTitle();
        this.description = crisis.getDescription();
        this.status = crisis.getStatus();
        this.category = crisis.getCategory();
        this.reporterName = crisis.getReporterName() != null ? 
            crisis.getReporterName() : 
            "Anonymous";
        this.reportTime = crisis.getReportTime();
        this.address = crisis.getAddress();
    }
    
    // Getters and setters
    public CrisisReportForResponder() {
    }

    // Getters
    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getStatus() {
        return status;
    }

    public String getCategory() {
        return category;
    }

    public String getReporterName() {
        return reporterName;
    }

    public LocalDateTime getReportTime() {
        return reportTime;
    }

    public String getAddress() {
        return address;
    }

    // Setters
    public void setId(Long id) {
        this.id = id;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public void setReporterName(String reporterName) {
        this.reporterName = reporterName;
    }

    public void setReportTime(LocalDateTime reportTime) {
        this.reportTime = reportTime;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    // Optional: toString() method for debugging
    @Override
    public String toString() {
        return "CrisisReportForResponder{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", status='" + status + '\'' +
                ", category='" + category + '\'' +
                ", reporterName='" + reporterName + '\'' +
                ", reportTime=" + reportTime +
                ", address='" + address + '\'' +
                '}';
    }
}