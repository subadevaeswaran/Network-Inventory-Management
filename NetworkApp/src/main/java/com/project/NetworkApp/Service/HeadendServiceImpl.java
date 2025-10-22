package com.project.NetworkApp.Service;

// package com.project.NetworkApp.service;

import com.project.NetworkApp.Repository.HeadendRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HeadendServiceImpl implements HeadendService {
    @Autowired
    private HeadendRepository headendRepository;

    @Override
    public List<String> getDistinctCities() {
        return headendRepository.findDistinctCities();
    }
}