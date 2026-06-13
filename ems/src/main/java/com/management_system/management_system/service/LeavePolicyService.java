package com.management_system.management_system.service;

import com.management_system.management_system.dto.ApiResponse;
import com.management_system.management_system.dto.LeavePolicyDTO;
import com.management_system.management_system.dto.LeavePolicyResponseDTO;
import com.management_system.management_system.entity.LeavePolicy;
import com.management_system.management_system.entity.Role;
import com.management_system.management_system.repository.LeavePolicyRepository;
import com.management_system.management_system.repository.RoleRepository;
import org.apache.coyote.Response;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class LeavePolicyService {

        private final LeavePolicyRepository leavePolicyRepository;
        private final RoleRepository roleRepository;

        public LeavePolicyService(LeavePolicyRepository leavePolicyRepository, RoleRepository roleRepository) {
                this.leavePolicyRepository = leavePolicyRepository;
                this.roleRepository = roleRepository;
        }

        public ResponseEntity<ApiResponse> createPolicy(
                        LeavePolicyDTO dto) {

                Optional<Role> role = roleRepository.findById(
                                dto.getRoleId());

                if (role.isEmpty()) {
                        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                        .body(new ApiResponse(
                                                        404,
                                                        "Role not found"));
                }

                if (leavePolicyRepository.existsByRoleIdAndYear(
                                dto.getRoleId(),
                                dto.getYear())) {

                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                        .body(new ApiResponse(
                                                        400,
                                                        "Policy already exists for this role and year"));
                }

                LeavePolicy leavePolicy = new LeavePolicy();

                leavePolicy.setRole(role.get());
                leavePolicy.setYear(dto.getYear());
                leavePolicy.setSickLeave(dto.getSickLeave());
                leavePolicy.setCasualLeave(dto.getCasualLeave());
                leavePolicy.setEarnedLeave(dto.getEarnedLeave());

                leavePolicyRepository.save(leavePolicy);

                return ResponseEntity.status(HttpStatus.CREATED)
                                .body(new ApiResponse(
                                                201,
                                                "Leave policy created successfully"));
        }

        public List<LeavePolicyResponseDTO> getAllPolicies() {

                return leavePolicyRepository.findAll()
                                .stream()
                                .map(policy -> {

                                        LeavePolicyResponseDTO dto = new LeavePolicyResponseDTO();

                                        dto.setId(policy.getId());

                                        dto.setRoleId(
                                                        policy.getRole().getId());

                                        dto.setRoleName(
                                                        policy.getRole().getRoleName());

                                        dto.setYear(
                                                        policy.getYear());

                                        dto.setSickLeave(
                                                        policy.getSickLeave());

                                        dto.setCasualLeave(
                                                        policy.getCasualLeave());

                                        dto.setEarnedLeave(
                                                        policy.getEarnedLeave());

                                        return dto;
                                })
                                .toList();
        }
}
