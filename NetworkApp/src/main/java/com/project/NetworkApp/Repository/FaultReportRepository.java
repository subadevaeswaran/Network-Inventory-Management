package com.project.NetworkApp.Repository;

import com.project.NetworkApp.entity.FaultReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FaultReportRepository extends JpaRepository<FaultReport, Long> {}
