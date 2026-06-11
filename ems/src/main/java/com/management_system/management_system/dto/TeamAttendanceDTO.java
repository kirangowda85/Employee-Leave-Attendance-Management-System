package com.management_system.management_system.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TeamAttendanceDTO {

    private String employeeCode;

    private String employeeName;

    private Double workingHours;

    private String status;
}