package com.management_system.management_system.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LeavePolicyResponseDTO {

    private Long id;

    private Long roleId;

    private String roleName;

    private Integer year;

    private int sickLeave;

    private int casualLeave;

    private int earnedLeave;
}