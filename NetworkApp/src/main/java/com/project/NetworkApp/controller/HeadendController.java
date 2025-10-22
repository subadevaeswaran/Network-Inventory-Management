package com.project.NetworkApp.controller;
// package com.project.NetworkApp.controller;

import com.project.NetworkApp.Service.HeadendService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/headends")
@CrossOrigin("http://localhost:5173")
@RequiredArgsConstructor
public class HeadendController {

    @Autowired
    private  HeadendService headendService;

    @GetMapping("/cities")
    public ResponseEntity<List<String>> getCities() {
        return ResponseEntity.ok(headendService.getDistinctCities());
    }
}