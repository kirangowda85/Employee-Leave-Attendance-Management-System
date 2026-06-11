package com.management_system.management_system.controller;

import com.management_system.management_system.dto.LeaveBalanceDTO;
import com.management_system.management_system.service.LeaveBalanceService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api/leave-balances")
public class LeaveBalanceController {
    private LeaveBalanceService leaveBalanceService;

    public LeaveBalanceController(LeaveBalanceService leaveBalanceService) {
        this.leaveBalanceService = leaveBalanceService;
    }

    @GetMapping("/my-balance")
    public LeaveBalanceDTO getMyBalance() {
        return leaveBalanceService.getMyBalance();
    }

}



