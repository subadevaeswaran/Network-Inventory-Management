package com.project.NetworkApp.Service;


import com.project.NetworkApp.DTO.FdhCreateDTO;
import com.project.NetworkApp.DTO.FdhResponseDTO;
import com.project.NetworkApp.entity.Fdh;

import java.util.List;

public interface FdhService {
    List<String> getDistinctRegions();

    List<String> getRegionsByCity(String city);

    List<FdhResponseDTO> getFdhsByCity(String city);

    List<Fdh> getFdhsByRegion(String region);

    FdhResponseDTO createFdh(FdhCreateDTO fdhCreateDTO);

    List<Fdh> getFdhsByCityAndRegion(String city, String region);
}