package com.project.NetworkApp.Service;

import com.project.NetworkApp.entity.Splitter;


import com.project.NetworkApp.entity.Splitter;
import java.util.List;

public interface SplitterService {
    List<Splitter> getSplittersByFdh(Integer fdhId);
}