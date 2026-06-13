package com.management_system.management_system.controller;

import com.management_system.management_system.dto.ApiResponse;
import com.management_system.management_system.dto.EmployeeRequestDTO;
import com.management_system.management_system.entity.Employee;
import com.management_system.management_system.service.EmployeeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse> createEmployee(
            @RequestBody EmployeeRequestDTO dto) {
        return employeeService.createEmployee(dto);
    }

    @GetMapping
    public ResponseEntity<List<Employee>> getAllEmployees() {
        return employeeService.getAllEmployees();
    }

    // FIX: Added PUT endpoint — frontend Employees.jsx calls PUT
    // /api/employees/{id}
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse> updateEmployee(
            @PathVariable Long id,
            @RequestBody EmployeeRequestDTO dto) {
        return employeeService.updateEmployee(id, dto);
    }

    // FIX: Added DELETE endpoint — frontend Employees.jsx calls DELETE
    // /api/employees/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteEmployee(
            @PathVariable Long id) {
        return employeeService.deleteEmployee(id);
    }
}
