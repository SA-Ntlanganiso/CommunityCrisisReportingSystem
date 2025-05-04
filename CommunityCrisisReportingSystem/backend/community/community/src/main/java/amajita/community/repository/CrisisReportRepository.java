package amajita.community.repository;
import amajita.community.repository.CrisisReportRepository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import amajita.community.model.CrisisReport;

public interface CrisisReportRepository extends JpaRepository<CrisisReport, Long> {
    List<CrisisReport> findByResponderId(Long responderId);
    List<CrisisReport> findByResponderIdAndStatusNot(Long responderId, String status);
    List<CrisisReport> findByReporterId(Long reporterId);
}

