package com.project.NetworkApp.entity;

// package com.example.inventory.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.Set;

@Entity
@Table(name = "technicians")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Technician {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "technician_id")
    private Integer id;

    private String name;
    private String contact;
    private String region;

    @OneToMany(mappedBy = "technician", fetch = FetchType.LAZY)
    private Set<DeploymentTask> deploymentTasks;
}
