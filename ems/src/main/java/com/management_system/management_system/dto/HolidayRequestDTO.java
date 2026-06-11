package com.management_system.management_system.dto;



import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class HolidayRequestDTO {

    private String holidayName;

    private LocalDate holidayDate;

    private String description;
}