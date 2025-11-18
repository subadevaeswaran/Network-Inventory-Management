package com.project.NetworkApp.Service;



import com.project.NetworkApp.DTO.HeadendDTO;
import com.project.NetworkApp.Repository.HeadendRepository;
import com.project.NetworkApp.Utility.HeadendUtility;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
@RequiredArgsConstructor
public class HeadendServiceImpl implements HeadendService {

    private final HeadendRepository headendRepository;

    @Override
    public List<String> getDistinctCities() {
        return headendRepository.findDistinctCities();
    }

    @Override
    public List<HeadendDTO> getAllHeadends() {
        return headendRepository.findAll().stream()
                .map(HeadendUtility::toDTO)
                .toList();
    }
}