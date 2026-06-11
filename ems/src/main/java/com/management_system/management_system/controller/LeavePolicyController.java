package com.management_system.management_system.controller;

import com.management_system.management_system.dto.ApiResponse;
import com.management_system.management_system.dto.LeavePolicyDTO;
import com.management_system.management_system.dto.LeavePolicyResponseDTO;
import com.management_system.management_system.entity.LeavePolicy;
import com.management_system.management_system.service.LeavePolicyService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leave-policies")
public class LeavePolicyController {

    private final LeavePolicyService leavePolicyService;

    public LeavePolicyController(
            LeavePolicyService leavePolicyService) {

        this.leavePolicyService = leavePolicyService;
    }
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ApiResponse> createPolicy(
            @RequestBody LeavePolicyDTO dto) {

        return leavePolicyService.createPolicy(dto);
    }
    @GetMapping
    public List<LeavePolicyResponseDTO> getAllPolicies() {

        return leavePolicyService.getAllPolicies();
    }
}