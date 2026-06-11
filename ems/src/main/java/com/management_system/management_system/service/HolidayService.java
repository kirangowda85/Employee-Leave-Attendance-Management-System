package com.management_system.management_system.service;


import com.management_system.management_system.dto.ApiResponse;
import com.management_system.management_system.dto.HolidayRequestDTO;
import com.management_system.management_system.dto.HolidayResponseDTO;
import com.management_system.management_system.entity.Holiday;
import com.management_system.management_system.repository.HolidayRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Optional;

public class HolidayService {

    private final HolidayRepository holidayRepository;


    public HolidayService(HolidayRepository holidayRepository) {
        this.holidayRepository = holidayRepository;
    }
    public ResponseEntity<ApiResponse> createHoliday(HolidayRequestDTO dto) {


        Holiday holiday = new Holiday();

        holiday.setHolidayname(
                dto.getHolidayName()
        );

        holiday.setHolidaydate(
                dto.getHolidayDate()
        );

        holiday.setDescription(
                dto.getDescription()
        );
    holidayRepository.save(holiday);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse(
                        201,
                        "Holiday created successfully"
                ));
    }
    public List<HolidayResponseDTO> getAllHolidays(){
        return holidayRepository.findAll()
                .stream()
                .map(holiday -> {

                    HolidayResponseDTO dto =
                            new HolidayResponseDTO();

                    dto.setId(holiday.getId());
                    dto.setHolidayName(
                            holiday.getHolidayname()
                    );
                    dto.setHolidayDate(
                            holiday.getHolidaydate()
                    );
                    dto.setDescription(
                            holiday.getDescription()
                    );

                    return dto;
                })
                .toList();
    }

    public ResponseEntity<?> getHolidayById(Long id) {

        Optional<Holiday> holiday =
                holidayRepository.findById(id);

        if (holiday.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(
                            404,
                            "Holiday not found"
                    ));
        }

        HolidayResponseDTO dto =
                new HolidayResponseDTO();

        dto.setId(holiday.get().getId());
        dto.setHolidayName(
                holiday.get().getHolidayname()
        );
        dto.setHolidayDate(
                holiday.get().getHolidaydate()
        );
        dto.setDescription(
                holiday.get().getDescription()
        );

        return ResponseEntity.ok(dto);
    }
    public ResponseEntity<ApiResponse> deleteHoliday(
            Long id) {

        if (!holidayRepository.existsById(id)) {

            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(
                            404,
                            "Holiday not found"
                    ));
        }

        holidayRepository.deleteById(id);

        return ResponseEntity.ok(
                new ApiResponse(
                        200,
                        "Holiday deleted successfully"
                )
        );
    }

}
