package com.management_system.management_system.service;

import com.management_system.management_system.dto.ApiResponse;
import com.management_system.management_system.dto.AttendanceEventDTO;
import com.management_system.management_system.entity.AttendanceEvent;
import com.management_system.management_system.entity.Employee;
import com.management_system.management_system.repository.AttendanceEventRepository;
import com.management_system.management_system.repository.EmployeeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class AttendanceEventService {
        private final AttendanceService attendanceService;
        private final AttendanceEventRepository attendanceEventRepository;
        private final EmployeeRepository employeeRepository;

        public AttendanceEventService(AttendanceService attendanceService,
                        AttendanceEventRepository attendanceEventRepository, EmployeeRepository employeeRepository) {
                this.attendanceService = attendanceService;
                this.attendanceEventRepository = attendanceEventRepository;
                this.employeeRepository = employeeRepository;
        }

        public ResponseEntity<ApiResponse> markAttendanceEvent(
                        AttendanceEventDTO dto) {

                Optional<Employee> employee = employeeRepository.findById(
                                dto.getEmployeeId());

                if (employee.isEmpty()) {

                        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                        .body(new ApiResponse(
                                                        404,
                                                        "Employee not found"));
                }

                AttendanceEvent event = new AttendanceEvent();

                event.setEmployee(
                                employee.get());

                event.setEventType(
                                dto.getEventType());

                event.setEventTime(
                                LocalDateTime.now());

                attendanceEventRepository.save(
                                event);
                attendanceService.calculateDailyAttendance(
                                employee.get().getId(),
                                LocalDate.now());

                return ResponseEntity.status(HttpStatus.CREATED)
                                .body(new ApiResponse(
                                                201,
                                                "Attendance event recorded successfully"));
        }
}
