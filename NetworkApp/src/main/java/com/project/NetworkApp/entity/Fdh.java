package com.project.NetworkApp.entity;

// package com.example.inventory.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.Set;

@Entity
@Table(name = "fdh")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Fdh {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "fdh_id")
    private Integer id;

    private String name;
    private String location;
    private String region;
    private int maxPorts;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "headend_id")
    private Headend headend;

    @OneToMany(mappedBy = "fdh", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Splitter> splitters;
}