package com.management_system.management_system.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LeavePolicyDTO {

    private Long roleId;

    private int sickLeave;

    private int casualLeave;

    private int earnedLeave;
    private Integer year;
}