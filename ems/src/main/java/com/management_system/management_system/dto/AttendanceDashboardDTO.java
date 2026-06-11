package com.management_system.management_system.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AttendanceDashboardDTO {

    private int presentDays;

    private int halfDays;

    private int absentDays;

    private int onLeaveDays;

    private int holidayDays;

    private double attendancePercentage;
}