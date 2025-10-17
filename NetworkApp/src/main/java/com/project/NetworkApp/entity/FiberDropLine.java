package com.project.NetworkApp.entity;


import com.project.NetworkApp.enums.FiberLineStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;

@Entity
@Table(name = "fiber_drop_lines")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FiberDropLine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "line_id")
    private Integer id;

    @Column(precision = 6, scale = 2)
    private BigDecimal lengthMeters;

    @Enumerated(EnumType.STRING)
    private FiberLineStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_splitter_id")
    private Splitter splitter;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "to_customer_id", unique = true)
    private Customer customer;
}