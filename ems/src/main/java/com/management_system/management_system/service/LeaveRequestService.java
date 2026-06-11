package com.management_system.management_system.service;


import com.management_system.management_system.dto.*;
import com.management_system.management_system.entity.*;
import com.management_system.management_system.repository.EmployeeRepository;
import com.management_system.management_system.repository.LeaveBalanceRepository;
import com.management_system.management_system.repository.LeaveRequestRepository;
import com.management_system.management_system.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

import static java.util.stream.Collectors.toList;

@Service
public class LeaveRequestService {
    private LeaveRequestRepository leaveRequestRepository;



    private final LeaveBalanceRepository leaveBalanceRepository;

    private EmployeeRepository employeeRepository;
    public LeaveRequestService(LeaveRequestRepository leaveRequestRepository, LeaveBalanceRepository leaveBalanceRepository,
                               EmployeeRepository employeeRepository) {
        this.leaveRequestRepository = leaveRequestRepository;
        this.leaveBalanceRepository = leaveBalanceRepository;
        this.employeeRepository = employeeRepository;
    }

    public ResponseEntity<ApiResponse> createLeaveRequest(LeaveRequestDTO dto) {
        LeaveRequest leaveRequest=new LeaveRequest();

        leaveRequest.setLeaveType(dto.getLeaveType());
        leaveRequest.setReason(dto.getReason());
        if (dto.getFromDate().isAfter(dto.getToDate())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(400, "From date cannot be after To date"));
        }
        leaveRequest.setFromDate(dto.getFromDate());
        leaveRequest.setToDate(dto.getToDate());
        User loggedUser=(User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Optional<Employee> employee = employeeRepository.findByUserId(loggedUser.getId());
        if (employee.isEmpty()){
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(404, "Employee profile not found"));
        }
        leaveRequest.setEmployee(employee.get());
        leaveRequest.setApprovedBy(employee.get().getManagerId());
        leaveRequest.setStatus(LeaveStatus.PENDING);
        leaveRequest.setAppliedDate(LocalDate.now());
       leaveRequestRepository.save(leaveRequest);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse(201, "Leave request created successfully"));
    }

@Transactional
    public ResponseEntity<ApiResponse> processLeaveAction(
            LeaveApprovalDTO dto) {

        Optional<LeaveRequest> leaveRequest =
                leaveRequestRepository.findById(
                        dto.getLeaveRequestId()
                );

        if (leaveRequest.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(
                            404,
                            "Leave request not found"
                    ));
        }

        User loggedUser = (User) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        Optional<Employee> manager =
                employeeRepository.findByUserId(
                        loggedUser.getId()
                );

        if (manager.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(
                            404,
                            "Manager profile not found"
                    ));
        }

        if (!leaveRequest.get().getApprovedBy()
                .equals(manager.get().getId())) {

            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse(
                            403,
                            "You are not authorized to approve this leave"
                    ));
        }
    if (leaveRequest.get().getStatus() != LeaveStatus.PENDING) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse(
                        400,
                        "Leave request already processed"
                ));
    }

        if ("approve".equalsIgnoreCase(dto.getAction())) {


            long leaveDays =
                    ChronoUnit.DAYS.between(
                            leaveRequest.get().getFromDate(),
                            leaveRequest.get().getToDate()
                    ) + 1;
            int currentYear =
                    LocalDate.now().getYear();
            Optional<LeaveBalance> leaveBalance =
                    leaveBalanceRepository
                            .findByEmployeeIdAndYear(
                                    leaveRequest.get()
                                            .getEmployee()
                                            .getId(),
                                    currentYear
                            );
            if (leaveBalance.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse(
                                404,
                                "Leave balance not found"
                        ));
            }
            LeaveType leaveType =
                    leaveRequest.get().getLeaveType();
            if (leaveType == LeaveType.SickLeave) {

                if (leaveBalance.get().getSickLeave()
                        < leaveDays) {

                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(new ApiResponse(
                                    400,
                                    "Insufficient sick leave balance"
                            ));
                }

                leaveBalance.get().setSickLeave(
                        leaveBalance.get().getSickLeave()
                                - (int) leaveDays
                );
            }
            else if (leaveType == LeaveType.CasualLeave) {

                if (leaveBalance.get().getCasualLeave()
                        < leaveDays) {

                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(new ApiResponse(
                                    400,
                                    "Insufficient casual leave balance"
                            ));
                }

                leaveBalance.get().setCasualLeave(
                        leaveBalance.get().getCasualLeave()
                                - (int) leaveDays
                );
            }
            else if (leaveType == LeaveType.EarnedLeave) {

                if (leaveBalance.get().getEarnedLeave()
                        < leaveDays) {

                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(new ApiResponse(
                                    400,
                                    "Insufficient earned leave balance"
                            ));
                }

                leaveBalance.get().setEarnedLeave(
                        leaveBalance.get().getEarnedLeave()
                                - (int) leaveDays
                );
            }
            leaveBalanceRepository.save(
                    leaveBalance.get()
            );

            leaveRequest.get()
                    .setStatus(LeaveStatus.APPROVED);

        } else if ("reject".equalsIgnoreCase(dto.getAction())) {

            leaveRequest.get()
                    .setStatus(LeaveStatus.REJECTED);

        } else {

            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(
                            400,
                            "Invalid action"
                    ));
        }

        leaveRequestRepository.save(
                leaveRequest.get()
        );

        return ResponseEntity.ok(
                new ApiResponse(
                        200,
                        "Leave request "
                                + leaveRequest.get().getStatus()
                                + " successfully"
                )
        );
    }
    public List<LeaveListDTO> getMyLeaves() {

        User loggedUser = (User) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        Optional<Employee> employee =
                employeeRepository.findByUserId(
                        loggedUser.getId()
                );

        if (employee.isEmpty()) {
            return List.of();
        }

        return leaveRequestRepository
                .findByEmployeeId(employee.get().getId())
                .stream()
                .map(leave -> {

                    LeaveListDTO dto = new LeaveListDTO();

                    dto.setLeaveId(leave.getId());
                    dto.setLeaveType(
                            leave.getLeaveType().name()
                    );
                    dto.setFromDate(
                            leave.getFromDate()
                    );
                    dto.setToDate(
                            leave.getToDate()
                    );
                    dto.setStatus(
                            leave.getStatus().name()
                    );
                    dto.setAppliedDate(
                            leave.getAppliedDate()
                    );

                    return dto;
                })
                .toList();
    }


    public List<ManagerLeaveListDTO> getPendingLeaves() {

        User loggedUser = (User) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        Optional<Employee> manager =
                employeeRepository.findByUserId(
                        loggedUser.getId()
                );

        if (manager.isEmpty()) {
            return List.of();
        }

        List<LeaveRequest> pendingLeaves =
                leaveRequestRepository.findByApprovedByAndStatus(
                        manager.get().getId(),
                        LeaveStatus.PENDING
                );

        return pendingLeaves.stream()
                .map(leave -> {
                    ManagerLeaveListDTO dto =
                            new ManagerLeaveListDTO();

                    dto.setLeaveId(leave.getId());
                    dto.setEmployeeCode(
                            leave.getEmployee().getEmployeeCode()
                    );
                    dto.setEmployeeName(
                            leave.getEmployee().getFirstName()
                                    + " "
                                    + leave.getEmployee().getLastName()
                    );
                    dto.setLeaveType(
                            leave.getLeaveType().name()
                    );
                    dto.setFromDate(
                            leave.getFromDate()
                    );
                    dto.setToDate(
                            leave.getToDate()
                    );
                    dto.setStatus(
                            leave.getStatus().name()
                    );
                    dto.setAppliedDate(
                            leave.getAppliedDate()
                    );

                    return dto;
                })
                .toList();
    }

    public List<ManagerLeaveListDTO> getTeamLeaveHistory() {

        User loggedUser = (User) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        Optional<Employee> manager =
                employeeRepository.findByUserId(
                        loggedUser.getId()
                );

        if (manager.isEmpty()) {
            return List.of();
        }
        List<LeaveRequest> teamLeaves =
                leaveRequestRepository.findByApprovedBy(
                        manager.get().getId()
                );
        return teamLeaves.stream()
                .map(leave -> {
                    ManagerLeaveListDTO dto =
                            new ManagerLeaveListDTO();

                    dto.setLeaveId(leave.getId());
                    dto.setEmployeeCode(
                            leave.getEmployee().getEmployeeCode()
                    );
                    dto.setEmployeeName(
                            leave.getEmployee().getFirstName()
                                    + " "
                                    + leave.getEmployee().getLastName()
                    );
                    dto.setLeaveType(
                            leave.getLeaveType().name()
                    );
                    dto.setFromDate(
                            leave.getFromDate()
                    );
                    dto.setToDate(
                            leave.getToDate()
                    );
                    dto.setStatus(
                            leave.getStatus().name()
                    );
                    dto.setAppliedDate(
                            leave.getAppliedDate()
                    );

                    return dto;
                })
                .toList();


    }

}
