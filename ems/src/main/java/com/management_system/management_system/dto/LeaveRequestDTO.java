package com.management_system.management_system.dto;

import com.management_system.management_system.entity.LeaveStatus;
import com.management_system.management_system.entity.LeaveType;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class LeaveRequestDTO {
    @Enumerated(EnumType.STRING)
    private LeaveType leaveType;
    private LocalDate fromDate;
    private LocalDate toDate;
    private String reason;
}
