package com.management_system.management_system.service;

import com.management_system.management_system.dto.AttendanceResponseDTO;
import com.management_system.management_system.dto.TeamAttendanceDTO;
import com.management_system.management_system.entity.*;
import com.management_system.management_system.repository.AttendanceEventRepository;
import com.management_system.management_system.repository.AttendanceRepository;
import com.management_system.management_system.repository.EmployeeRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final AttendanceEventRepository attendanceEventRepository;
    private final EmployeeRepository employeeRepository;

    public AttendanceService(
            AttendanceRepository attendanceRepository,
            AttendanceEventRepository attendanceEventRepository,
            EmployeeRepository employeeRepository) {

        this.attendanceRepository = attendanceRepository;
        this.attendanceEventRepository = attendanceEventRepository;
        this.employeeRepository = employeeRepository;
    }

    public void calculateDailyAttendance(
            Long employeeId,
            LocalDate date) {

        Optional<Employee> employee =
                employeeRepository.findById(employeeId);

        if (employee.isEmpty()) {
            return;
        }

        LocalDateTime start =
                date.atStartOfDay();

        LocalDateTime end =
                date.atTime(23, 59, 59);

        List<AttendanceEvent> events =
                attendanceEventRepository
                        .findByEmployeeIdAndEventTimeBetween(
                                employeeId,
                                start,
                                end
                        );

        if (events.isEmpty()) {
            return;
        }

        events.sort(
                Comparator.comparing(
                        AttendanceEvent::getEventTime
                )
        );

        long totalMinutes = 0;

        AttendanceEvent entryEvent = null;

        for (AttendanceEvent event : events) {

            if (event.getEventType() == EventType.ENTRY) {

                entryEvent = event;

            } else if (event.getEventType() == EventType.EXIT
                    && entryEvent != null) {

                totalMinutes += ChronoUnit.MINUTES.between(
                        entryEvent.getEventTime(),
                        event.getEventTime()
                );

                entryEvent = null;
            }
        }

        double workingHours =
                totalMinutes / 60.0;

        AttendanceStatus status;

        if (workingHours >= 8) {
            status = AttendanceStatus.PRESENT;
        }
        else if (workingHours >= 4) {
            status = AttendanceStatus.HALF_DAY;
        }
        else {
            status = AttendanceStatus.ABSENT;
        }

        Optional<Attendance> existingAttendance =
                attendanceRepository
                        .findByEmployeeIdAndAttendanceDate(
                                employeeId,
                                date
                        );

        Attendance attendance;

        if (existingAttendance.isPresent()) {

            attendance = existingAttendance.get();

        } else {

            attendance = new Attendance();

            attendance.setEmployee(
                    employee.get()
            );

            attendance.setAttendanceDate(
                    date
            );
        }

        attendance.setWorkingHours(
                workingHours
        );

        attendance.setStatus(
                status
        );

        attendanceRepository.save(
                attendance
        );
    }




    public AttendanceResponseDTO getMyAttendance() {

        User loggedUser = (User) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        Optional<Employee> employee =
                employeeRepository.findByUserId(
                        loggedUser.getId()
                );

        if (employee.isEmpty()) {
            return null;
        }

        Optional<Attendance> attendance =
                attendanceRepository
                        .findByEmployeeIdAndAttendanceDate(
                                employee.get().getId(),
                                LocalDate.now()
                        );

        if (attendance.isEmpty()) {
            return null;
        }

        AttendanceResponseDTO dto =
                new AttendanceResponseDTO();

        dto.setAttendanceDate(
                attendance.get().getAttendanceDate()
        );

        dto.setWorkingHours(
                attendance.get().getWorkingHours()
        );

        dto.setStatus(
                attendance.get().getStatus().name()
        );

        return dto;
    }

    public List<TeamAttendanceDTO> getTeamAttendance() {
        User loggedUser = (User) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        Optional<Employee> manager =
                employeeRepository.findByUserId(
                        loggedUser.getId()
                );

        List<Employee> employees =
                employeeRepository.findByManagerId(
                        manager.get().getId()
                );
        List<TeamAttendanceDTO> response = new ArrayList<>();

        for (Employee employee : employees) {

            TeamAttendanceDTO dto =
                    new TeamAttendanceDTO();

            dto.setEmployeeCode(
                    employee.getEmployeeCode()
            );

            dto.setEmployeeName(
                    employee.getFirstName()
                            + " "
                            + employee.getLastName()
            );

            Optional<Attendance> attendance =
                    attendanceRepository
                            .findByEmployeeIdAndAttendanceDate(
                                    employee.getId(),
                                    LocalDate.now()
                            );

            if (attendance.isPresent()) {

                dto.setWorkingHours(
                        attendance.get().getWorkingHours()
                );

                dto.setStatus(
                        attendance.get().getStatus().name()
                );

            } else {

                dto.setWorkingHours(
                        0.0
                );

                dto.setStatus(
                        "ABSENT"
                );
            }

            response.add(dto);
        }

        return response;

    }
}