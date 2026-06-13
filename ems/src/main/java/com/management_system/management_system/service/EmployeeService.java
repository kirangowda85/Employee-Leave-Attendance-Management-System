package com.management_system.management_system.service;

import com.management_system.management_system.dto.ApiResponse;
import com.management_system.management_system.dto.EmployeeRequestDTO;
import com.management_system.management_system.entity.Employee;
import com.management_system.management_system.entity.LeaveBalance;
import com.management_system.management_system.entity.LeavePolicy;
import com.management_system.management_system.entity.User;
import com.management_system.management_system.repository.EmployeeRepository;
import com.management_system.management_system.repository.LeaveBalanceRepository;
import com.management_system.management_system.repository.LeavePolicyRepository;
import com.management_system.management_system.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Optional;

@Service
public class EmployeeService {

        private final EmployeeRepository employeeRepository;
        private final UserRepository userRepository;
        private final LeaveBalanceRepository leaveBalanceRepository;
        private final LeavePolicyRepository leavePolicyRepository;

        public EmployeeService(EmployeeRepository employeeRepository, UserRepository userRepository,
                        LeaveBalanceRepository leaveBalanceRepository, LeavePolicyRepository leavePolicyRepository) {
                this.employeeRepository = employeeRepository;
                this.userRepository = userRepository;
                this.leaveBalanceRepository = leaveBalanceRepository;
                this.leavePolicyRepository = leavePolicyRepository;
        }

        // Method to create a new employee
        public ResponseEntity<ApiResponse> createEmployee(EmployeeRequestDTO dto) {

                User loggedInUser = (User) SecurityContextHolder
                                .getContext()
                                .getAuthentication()
                                .getPrincipal();

                Optional<User> user = userRepository.findById(dto.getUserId());

                if (user.isEmpty()) {
                        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                        .body(new ApiResponse(
                                                        404,
                                                        "User not found"));
                }

                if (employeeRepository.existsByUserId(dto.getUserId())) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                        .body(new ApiResponse(
                                                        400,
                                                        "Employee profile already exists"));
                }

                if (!loggedInUser.getId().equals(dto.getUserId())
                                && !loggedInUser.getRole().getRoleName().equals("ADMIN")) {

                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                        .body(new ApiResponse(
                                                        403,
                                                        "You can only create your own employee profile"));
                }

                Employee employee = new Employee();

                employee.setFirstName(dto.getFirstName());
                employee.setLastName(dto.getLastName());
                employee.setEmail(dto.getEmail());
                employee.setMobile(dto.getMobile());
                employee.setGender(dto.getGender());
                employee.setDateOfBirth(dto.getDateOfBirth());
                employee.setDateOfJoining(dto.getDateOfJoining());
                employee.setDepartment(dto.getDepartment());
                employee.setDesignation(dto.getDesignation());
                employee.setManagerId(dto.getManagerId());
                employee.setUser(user.get());

                Employee lastEmployee = employeeRepository.findTopByOrderByIdDesc();

                if (lastEmployee == null) {
                        employee.setEmployeeCode("EMP001");
                } else {
                        String lastEmployeeCode = lastEmployee.getEmployeeCode();

                        int numericPart = Integer.parseInt(
                                        lastEmployeeCode.substring(3));

                        numericPart++;

                        employee.setEmployeeCode(
                                        "EMP" + String.format("%03d", numericPart));
                }

                Employee savedEmployee = employeeRepository.save(employee);

                int currentYear = LocalDate.now().getYear();

                Optional<LeavePolicy> leavePolicy = leavePolicyRepository.findByRoleIdAndYear(
                                user.get().getRole().getId(),
                                currentYear);

                if (leavePolicy.isPresent()) {

                        LeaveBalance leaveBalance = new LeaveBalance();

                        leaveBalance.setEmployee(
                                        savedEmployee);

                        leaveBalance.setYear(
                                        currentYear);

                        leaveBalance.setSickLeave(
                                        leavePolicy.get().getSickLeave());

                        leaveBalance.setCasualLeave(
                                        leavePolicy.get().getCasualLeave());

                        leaveBalance.setEarnedLeave(
                                        leavePolicy.get().getEarnedLeave());

                        leaveBalanceRepository.save(
                                        leaveBalance);
                }

                return ResponseEntity.status(HttpStatus.CREATED)
                                .body(new ApiResponse(
                                                201,
                                                "Employee created successfully"));
        }

        public ResponseEntity<java.util.List<Employee>> getAllEmployees() {
                return ResponseEntity.ok(employeeRepository.findAll());
        }

        public ResponseEntity<ApiResponse> updateEmployee(Long id, EmployeeRequestDTO dto) {
                Optional<Employee> existing = employeeRepository.findById(id);
                if (existing.isEmpty()) {
                        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                        .body(new ApiResponse(404, "Employee not found"));
                }

                Employee employee = existing.get();
                employee.setFirstName(dto.getFirstName());
                employee.setLastName(dto.getLastName());
                employee.setEmail(dto.getEmail());
                employee.setMobile(dto.getMobile());
                employee.setGender(dto.getGender());
                employee.setDateOfBirth(dto.getDateOfBirth());
                employee.setDateOfJoining(dto.getDateOfJoining());
                employee.setDepartment(dto.getDepartment());
                employee.setDesignation(dto.getDesignation());

                employeeRepository.save(employee);
                return ResponseEntity.ok(new ApiResponse(200, "Employee updated successfully"));
        }

        public ResponseEntity<ApiResponse> deleteEmployee(Long id) {
                if (!employeeRepository.existsById(id)) {
                        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                        .body(new ApiResponse(404, "Employee not found"));
                }
                employeeRepository.deleteById(id);
                return ResponseEntity.ok(new ApiResponse(200, "Employee deleted successfully"));
        }
}