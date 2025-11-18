package com.project.NetworkApp.Service;

import com.project.NetworkApp.DTO.SplitterCreateDTO;
import com.project.NetworkApp.DTO.SplitterResponseDTO;

import java.util.List;

public interface SplitterService {
    List<SplitterResponseDTO> getSplittersByFdh(Integer fdhId);
    SplitterResponseDTO createSplitter(SplitterCreateDTO splitterCreateDTO);
}