package com.management_system.management_system.repository;

import com.management_system.management_system.entity.LeaveBalance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LeaveBalanceRepository extends JpaRepository<LeaveBalance, Long> {

    Optional<LeaveBalance> findByEmployeeId(
            Long employeeId
    );
    Optional<LeaveBalance> findByEmployeeIdAndYear(
            Long employeeId,
            Integer year
    );
    boolean existsByEmployeeIdAndYear(
            Long employeeId,
            Integer year
    );
}
