package com.management_system.management_system.controller;


import com.management_system.management_system.dto.ApiResponse;
import com.management_system.management_system.dto.HolidayRequestDTO;
import com.management_system.management_system.dto.HolidayResponseDTO;
import com.management_system.management_system.entity.Holiday;
import com.management_system.management_system.service.HolidayService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.PrivateKey;
import java.util.List;

@RestController
@RequestMapping("/admin/holiday")
public class HolidayController {

    private final HolidayService holidayService;

    public HolidayController(HolidayService holidayService) {
        this.holidayService = holidayService;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/add")
    public ResponseEntity<ApiResponse> addHoliday(
            @RequestBody HolidayRequestDTO holidayRequestDTO) {

        return holidayService.createHoliday(holidayRequestDTO);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public List<HolidayResponseDTO> getaAllHolidays() {
        return holidayService.getAllHolidays();
    }
    @GetMapping("/{id}")
    public ResponseEntity<?> getHolidayById(
            @PathVariable Long id) {

        return holidayService.getHolidayById(id);
    }
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteHoliday(
            @PathVariable Long id) {

        return holidayService.deleteHoliday(id);
    }

}
