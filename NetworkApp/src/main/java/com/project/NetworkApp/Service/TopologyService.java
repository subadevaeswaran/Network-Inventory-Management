package com.project.NetworkApp.Service;

import com.project.NetworkApp.DTO.TopologyNodeDTO;
import java.util.List;

public interface TopologyService {
    List<TopologyNodeDTO> getTopologyByCity(String city);
}
