package com.project.NetworkApp.controller;

import com.project.NetworkApp.DTO.FaultyDeviceSwapDTO;
import com.project.NetworkApp.Service.DeviceSwapService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("/devices") // Base path
@RequiredArgsConstructor
public class DeviceSwapController {

    private final DeviceSwapService deviceSwapService;

    @PostMapping("/report-and-swap") // Endpoint for the swap
    public ResponseEntity<?> reportAndSwapDevice(@RequestBody FaultyDeviceSwapDTO dto) {
        try {
            deviceSwapService.reportAndSwapFaultyDevice(dto);
            return ResponseEntity.ok(Map.of("message", "Device swapped successfully"));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "An internal error occurred."));
        }
    }
}
