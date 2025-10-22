package com.project.NetworkApp.controller;

// package com.project.NetworkApp.controller;
import com.project.NetworkApp.entity.Splitter;
import com.project.NetworkApp.Service.SplitterService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/splitters")
@CrossOrigin("http://localhost:5173")
@RequiredArgsConstructor
public class SplitterController {
    @Autowired
    private  SplitterService splitterService;

    @GetMapping("/by-fdh")
    public ResponseEntity<List<Splitter>> getSplittersByFdh(@RequestParam Integer fdhId) {
        return ResponseEntity.ok(splitterService.getSplittersByFdh(fdhId));
    }
}
