package com.management_system.management_system.entity;
import com.management_system.management_system.entity.EventType;

import jakarta.persistence.*;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "attendance_event")
@Getter
@Setter
public class AttendanceEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;

    private LocalDateTime eventTime;

    @Enumerated(EnumType.STRING)
    private EventType eventType;


}