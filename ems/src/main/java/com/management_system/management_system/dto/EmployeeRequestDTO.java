package com.management_system.management_system.dto;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class EmployeeRequestDTO {
    @NotBlank
    private String firstName;
    private String lastName;
    @NotBlank
    @Email
    private String email;
    private String mobile;

    private String gender;
    private LocalDate dateOfBirth;
    private LocalDate dateOfJoining;
    private String department;
    private String designation;

    private Long managerId;

    private long userId;

}
