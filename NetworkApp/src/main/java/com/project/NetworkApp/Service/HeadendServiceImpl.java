package com.project.NetworkApp.Service;

// package com.project.NetworkApp.service;

import com.project.NetworkApp.DTO.HeadendDTO;
import com.project.NetworkApp.Repository.HeadendRepository;
import com.project.NetworkApp.Utility.HeadendUtility;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HeadendServiceImpl implements HeadendService {
    @Autowired
    private HeadendRepository headendRepository;

    @Override
    public List<String> getDistinctCities() {
        return headendRepository.findDistinctCities();
    }

    @Override
    public List<HeadendDTO> getAllHeadends() {
        return headendRepository.findAll().stream()
                .map(HeadendUtility::toDTO)
                .collect(Collectors.toList());
    }
}