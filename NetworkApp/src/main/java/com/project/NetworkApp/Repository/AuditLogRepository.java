package com.project.NetworkApp.Repository;



import com.project.NetworkApp.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    // Add find methods later if needed for viewing logs
}