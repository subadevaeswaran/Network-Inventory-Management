package com.project.NetworkApp.controller;

import com.project.NetworkApp.DTO.TopologyNodeDTO;
import com.project.NetworkApp.Service.TopologyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/topology")
@RequiredArgsConstructor
public class TopologyController {

    private final TopologyService topologyService;

    @GetMapping
    public ResponseEntity<List<TopologyNodeDTO>> getTopology(
            @RequestParam(defaultValue = "all") String city) { // Default to 'all' if no city specified
        List<TopologyNodeDTO> topology = topologyService.getTopologyByCity(city);
        return ResponseEntity.ok(topology);
    }
}