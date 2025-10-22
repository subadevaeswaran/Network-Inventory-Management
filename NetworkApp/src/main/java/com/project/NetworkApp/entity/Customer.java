package com.project.NetworkApp.entity;


import com.project.NetworkApp.enums.ConnectionType;
import com.project.NetworkApp.enums.CustomerStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "customers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "customer_id")
    private Integer id;

    private String name;

    @Column(columnDefinition = "TEXT")
    private String address;

    private String neighborhood;
    private String plan;

    @Enumerated(EnumType.STRING)
    private ConnectionType connectionType;

    @Enumerated(EnumType.STRING)
    private CustomerStatus status;


    @Column(nullable = false)
    private String city;


    @Column(name = "assigned_port")
    private int assignedPort;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "splitter_id")
    private Splitter splitter;

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<AssignedAssets> assignedAssets;

    @OneToOne(mappedBy = "customer", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private FiberDropLine fiberDropLine;

    @OneToMany(mappedBy = "customer", fetch = FetchType.LAZY)
    private Set<DeploymentTask> deploymentTasks;
}