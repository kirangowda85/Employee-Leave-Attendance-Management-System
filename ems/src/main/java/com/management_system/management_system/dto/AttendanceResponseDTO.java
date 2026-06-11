package com.management_system.management_system.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class AttendanceResponseDTO {

    private LocalDate attendanceDate;

    private Double workingHours;

    private String status;
}