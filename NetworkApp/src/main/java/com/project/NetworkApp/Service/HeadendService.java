package com.project.NetworkApp.Service;

// package com.project.NetworkApp.service;

import com.project.NetworkApp.DTO.HeadendDTO;

import java.util.List;

public interface HeadendService {
    List<String> getDistinctCities();

    List<HeadendDTO> getAllHeadends();
}