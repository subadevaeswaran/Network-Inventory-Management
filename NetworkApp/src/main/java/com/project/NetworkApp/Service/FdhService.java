package com.project.NetworkApp.Service;

// package com.project.NetworkApp.service;

import com.project.NetworkApp.entity.Fdh;

import java.util.List;

public interface FdhService {
    List<String> getDistinctRegions();

    List<String> getRegionsByCity(String city);

    List<Fdh> getFdhsByCity(String city);

    List<Fdh> getFdhsByRegion(String region);
}