package com.management_system.management_system.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LeaveBalanceDTO {

    private Integer year;

    private int sickLeaveBalance;

    private int casualLeaveBalance;

    private int earnedLeaveBalance;
}