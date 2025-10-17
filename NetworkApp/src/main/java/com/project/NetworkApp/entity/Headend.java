package com.project.NetworkApp.entity;



import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.Set;

@Entity
@Table(name = "headends")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Headend {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "headend_id")
    private Integer id;

    private String name;
    private String location;

    @OneToMany(mappedBy = "headend", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Fdh> fdhs;
}