package com.project.NetworkApp.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDate;

@Entity
@Table(name = "fault_reports")
@Getter
@Setter
@NoArgsConstructor
public class FaultReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id", nullable = false)
    private Asset asset; // Link to the faulty asset

    @Column(nullable = false)
    private String faultType;

    @Column(nullable = false)
    private String priority;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private LocalDate reportedDate;

    @Column(nullable = false)
    private String status; // e.g., "OPEN", "IN_PROGRESS", "RESOLVED"

    private Integer reporterUserId; // The user ID of the person who reported it
}
