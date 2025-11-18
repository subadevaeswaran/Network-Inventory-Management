package com.project.NetworkApp.Service;

import com.project.NetworkApp.DTO.HeadendDTO;

import java.util.List;

public interface HeadendService {
    List<String> getDistinctCities();

    List<HeadendDTO> getAllHeadends();
}