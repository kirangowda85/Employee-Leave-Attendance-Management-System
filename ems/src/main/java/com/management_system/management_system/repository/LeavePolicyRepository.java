package com.management_system.management_system.repository;

import com.management_system.management_system.entity.LeavePolicy;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;


public interface LeavePolicyRepository extends JpaRepository<LeavePolicy, Long> {

    Optional<LeavePolicy> findByRoleIdAndYear(
            Long roleId,
            Integer year
    );
    boolean existsByRoleIdAndYear(
            Long roleId,
            Integer year
    );
}
