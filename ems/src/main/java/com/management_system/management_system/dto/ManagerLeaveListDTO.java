package com.management_system.management_system.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class ManagerLeaveListDTO {

    private Long leaveId;

    private String employeeCode;

    private String employeeName;

    private String leaveType;

    private LocalDate fromDate;

    private LocalDate toDate;

    private String status;

    private LocalDate appliedDate;
}