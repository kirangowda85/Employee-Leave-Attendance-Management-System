package com.management_system.management_system.service;

import com.management_system.management_system.dto.LeaveBalanceDTO;
import com.management_system.management_system.entity.Employee;
import com.management_system.management_system.entity.LeaveBalance;
import com.management_system.management_system.entity.User;
import com.management_system.management_system.repository.EmployeeRepository;
import com.management_system.management_system.repository.LeaveBalanceRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Optional;

@Service
public class LeaveBalanceService {
        private final EmployeeRepository employeeRepository;
        private final LeaveBalanceRepository leaveBalanceRepository;

        public LeaveBalanceService(EmployeeRepository employeeRepository,
                        LeaveBalanceRepository leaveBalanceRepository) {
                this.employeeRepository = employeeRepository;
                this.leaveBalanceRepository = leaveBalanceRepository;
        }

        public LeaveBalanceDTO getMyBalance() {
                User loggedUser = (User) SecurityContextHolder
                                .getContext()
                                .getAuthentication()
                                .getPrincipal();

                Optional<Employee> employee = employeeRepository.findByUserId(
                                loggedUser.getId());

                if (employee.isEmpty()) {
                        return null;
                }
                int currentYear = LocalDate.now().getYear();

                Optional<LeaveBalance> leaveBalance = leaveBalanceRepository
                                .findByEmployeeIdAndYear(
                                                employee.get().getId(),
                                                currentYear);
                if (leaveBalance.isEmpty()) {
                        return null;
                }
                LeaveBalanceDTO dto = new LeaveBalanceDTO();

                dto.setYear(
                                leaveBalance.get().getYear());

                dto.setSickLeaveBalance(
                                leaveBalance.get().getSickLeave());

                dto.setCasualLeaveBalance(
                                leaveBalance.get().getCasualLeave());

                dto.setEarnedLeaveBalance(
                                leaveBalance.get().getEarnedLeave());

                return dto;
        }
}
