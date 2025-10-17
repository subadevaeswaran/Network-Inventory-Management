package com.project.NetworkApp.entity;

// package com.example.inventory.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.Set;

@Entity
@Table(name = "splitters")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Splitter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "splitter_id")
    private Integer id;

    private String model;
    private int portCapacity;
    private int usedPorts;
    private String location;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fdh_id")
    private Fdh fdh;

    @OneToMany(mappedBy = "splitter", fetch = FetchType.LAZY)
    private Set<Customer> customers;

    @OneToMany(mappedBy = "splitter", fetch = FetchType.LAZY)
    private Set<FiberDropLine> fiberDropLines;
}