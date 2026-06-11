package com.management_system.management_system.controller;

import com.management_system.management_system.dto.AttendanceResponseDTO;
import com.management_system.management_system.dto.TeamAttendanceDTO;
import com.management_system.management_system.service.AttendanceService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(
            AttendanceService attendanceService) {

        this.attendanceService = attendanceService;
    }

    @GetMapping("/my-attendance")
    public AttendanceResponseDTO getMyAttendance() {

        return attendanceService.getMyAttendance();
    }

    @PreAuthorize("hasRole('MANAGER')")
    @GetMapping("/team")
    public List<TeamAttendanceDTO> getTeamAttendance() {

        return attendanceService.getTeamAttendance();
    }
}