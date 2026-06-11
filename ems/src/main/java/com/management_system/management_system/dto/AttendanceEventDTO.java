package com.management_system.management_system.dto;


import com.management_system.management_system.entity.EventType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AttendanceEventDTO {

    private Long employeeId;

    private EventType eventType;
}