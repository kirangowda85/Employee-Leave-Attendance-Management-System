package com.management_system.management_system.repository;

import com.management_system.management_system.entity.AttendanceEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface AttendanceEventRepository
        extends JpaRepository<AttendanceEvent, Long> {

    List<AttendanceEvent> findByEmployeeIdAndEventTimeBetween(
            Long employeeId,
            LocalDateTime start,
            LocalDateTime end
    );
    Optional<AttendanceEvent>
    findTopByEmployeeIdOrderByEventTimeDesc(
            Long employeeId
    );
}