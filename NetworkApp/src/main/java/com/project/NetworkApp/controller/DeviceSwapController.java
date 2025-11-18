package com.project.NetworkApp.controller;

import com.project.NetworkApp.DTO.FaultyDeviceSwapDTO;
import com.project.NetworkApp.Service.DeviceSwapService;
import com.project.NetworkApp.exception.AssetNotFoundException;
import com.project.NetworkApp.exception.InvalidAssetSwapException;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;
@RestController
@RequestMapping("/devices")
@RequiredArgsConstructor
public class DeviceSwapController {

    private final DeviceSwapService deviceSwapService;

    private static final Logger logger = LoggerFactory.getLogger(DeviceSwapController.class);
    @PostMapping("/report-and-swap")
    public ResponseEntity<Map<String, String>> reportAndSwapDevice(@RequestBody FaultyDeviceSwapDTO dto) {
        try {
            deviceSwapService.reportAndSwapFaultyDevice(dto);
            return ResponseEntity.ok(createMessage("Device swapped successfully"));
        } catch (AssetNotFoundException e) {
            logger.warn("Device not found for swap: {}", null, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(createMessage(e.getMessage()));
        } catch (InvalidAssetSwapException e) {
            logger.warn("Invalid device state for swap: {}", null, e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(createMessage(e.getMessage()));
        } catch (Exception e) {
            logger.error("Unexpected error while swapping device {}: {}", null, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createMessage("An internal error occurred."));
        }
    }
    private Map<String, String> createMessage(String msg) {
        return Map.of("message", msg);
    }
}
