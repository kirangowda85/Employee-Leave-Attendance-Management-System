package com.management_system.management_system.repository;

import com.management_system.management_system.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    Employee findTopByOrderByIdDesc();

    boolean existsByUserId(long userId);

    Optional<Employee> findByUserId(Long id);

    Optional<Employee> findByEmail(String email);
    List<Employee> findByManagerId(
            Long managerId
    );
}
