package com.project.NetworkApp.Service;

import com.project.NetworkApp.DTO.FaultyDeviceSwapDTO;

public interface DeviceSwapService {
    void reportAndSwapFaultyDevice(FaultyDeviceSwapDTO dto);
}