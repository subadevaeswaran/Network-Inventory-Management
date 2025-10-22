package com.project.NetworkApp.Service;

// package com.project.NetworkApp.service;
import com.project.NetworkApp.entity.Splitter;
import com.project.NetworkApp.Repository.SplitterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SplitterServiceImpl implements SplitterService {

    @Autowired
    private  SplitterRepository splitterRepository;

    @Override
    public List<Splitter> getSplittersByFdh(Integer fdhId) {
        return splitterRepository.findByFdhId(fdhId);
    }
}