package com.management_system.management_system.entity;


import jakarta.persistence.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;
    @NotBlank
   private String username;
    @NotBlank
   private String password;
  @NotBlank
  @Email @Column(unique = true)
   private String email;
   @ManyToOne
   @JoinColumn(name = "role_id", referencedColumnName = "id")
   private Role role;

   private boolean active;

}
