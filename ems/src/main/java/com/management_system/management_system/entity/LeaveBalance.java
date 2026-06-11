package com.management_system.management_system.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;


@Entity
@Getter
@Setter
@Table(name="leave_balance")

public class LeaveBalance {

    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Long id;
    @OneToOne
    @JoinColumn(name = "employee_id",referencedColumnName = "id")
    private Employee employee;
    private Integer year;
    private int casualLeave;
    private int sickLeave;
    private int earnedLeave;

}
