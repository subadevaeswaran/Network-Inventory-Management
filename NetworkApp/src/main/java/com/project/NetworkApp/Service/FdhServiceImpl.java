package com.project.NetworkApp.Service;

// package com.project.NetworkApp.service;

import com.project.NetworkApp.Repository.FdhRepository;
import com.project.NetworkApp.entity.Fdh;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FdhServiceImpl implements FdhService {
    @Autowired
    private  FdhRepository fdhRepository;

    @Override
    public List<String> getDistinctRegions() {
        return fdhRepository.findDistinctRegions();
    }

    @Override
    public List<String> getRegionsByCity(String city) {
        return fdhRepository.findDistinctRegionsByCity(city);
    }

    @Override
    public List<Fdh> getFdhsByCity(String city) {
        return fdhRepository.findByHeadendCity(city);
    }

    @Override
    public List<Fdh> getFdhsByRegion(String region) {
        return fdhRepository.findByRegion(region);
    }
}
