package com.management_system.management_system.controller;

import com.management_system.management_system.dto.*;
import com.management_system.management_system.entity.LeaveRequest;
import com.management_system.management_system.service.LeaveRequestService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaves")
public class LeaveRequestController {

    private final LeaveRequestService leaveRequestService;

    public LeaveRequestController(LeaveRequestService leaveRequestService) {
        this.leaveRequestService = leaveRequestService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse> applyLeave(@RequestBody LeaveRequestDTO dto) {
        return leaveRequestService.createLeaveRequest(dto);
    }
    @GetMapping("/my-leaves")
    public List<LeaveListDTO> getMyLeaves()
    {
        return leaveRequestService.getMyLeaves();
    }
    @GetMapping("/pending")
    public List<ManagerLeaveListDTO> getPendingLeaves() {
        return leaveRequestService.getPendingLeaves();
    }
    @PreAuthorize("hasRole('MANAGER')")
    @PostMapping("/action")
    public ResponseEntity<ApiResponse> leaveAction(
            @RequestBody LeaveApprovalDTO dto) {

        return leaveRequestService.processLeaveAction(dto);
    }
    @PreAuthorize("hasRole('MANAGER')")
    @GetMapping("/team-history")
    public List<ManagerLeaveListDTO> getTeamLeaveHistory() {

        return leaveRequestService.getTeamLeaveHistory();
    }
}