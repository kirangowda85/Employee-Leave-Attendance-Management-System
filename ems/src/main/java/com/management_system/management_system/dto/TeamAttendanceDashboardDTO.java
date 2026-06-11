package com.management_system.management_system.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TeamAttendanceDashboardDTO {

    private String employeeCode;
    private String employeeName;

    private int presentDays;
    private int halfDays;
    private int absentDays;
    private int onLeaveDays;

    private double attendancePercentage;
}