package com.management_system.management_system.controller;


import com.management_system.management_system.dto.ApiResponse;
import com.management_system.management_system.dto.AttendanceEventDTO;
import com.management_system.management_system.service.AttendanceEventService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceEventController {

    private final AttendanceEventService attendanceEventService;

    public AttendanceEventController(
            AttendanceEventService attendanceEventService) {

        this.attendanceEventService = attendanceEventService;
    }

    @PostMapping("/events")
    public ResponseEntity<ApiResponse> markAttendanceEvent(
            @RequestBody AttendanceEventDTO dto) {

        return attendanceEventService
                .markAttendanceEvent(dto);
    }
}
