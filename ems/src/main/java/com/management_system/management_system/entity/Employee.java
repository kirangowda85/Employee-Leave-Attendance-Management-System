package com.management_system.management_system.entity;


import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.OptimisticLock;


import java.time.LocalDate;
@Getter
@Setter
@Entity
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String firstName;
    private String lastName;
    @NotBlank
    @Email
    @Column(unique = true)
    private String email;

    private String mobile;
    @Column(nullable = false)
    private String employeeCode;
    private String gender;
    private LocalDate dateOfBirth;
    private LocalDate dateOfJoining;
    private String department;
    private String designation;
    @Column(nullable = false)
    private Long managerId;
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name="user_id", referencedColumnName = "id")
    private User user;

    private Boolean isFaceRegistered = false;
    private String faceImagePath;



}
