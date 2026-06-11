package com.management_system.management_system.repository;

import com.management_system.management_system.entity.LeaveRequest;
import com.management_system.management_system.entity.LeaveStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    Optional<LeaveRequest> findById(Long id);
    List<LeaveRequest> findByApprovedByAndStatus(
            Long managerId,
            LeaveStatus status
    );



    List<LeaveRequest> findByStatus(LeaveStatus status);

    List<LeaveRequest> findByApprovedBy(Long managerId);
    List<LeaveRequest> findByEmployeeId(Long employeeId);
}
