package com.management_system.management_system.controller;


import com.management_system.management_system.dto.ApiResponse;
import com.management_system.management_system.dto.EmployeeRequestDTO;
import com.management_system.management_system.service.EmployeeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}