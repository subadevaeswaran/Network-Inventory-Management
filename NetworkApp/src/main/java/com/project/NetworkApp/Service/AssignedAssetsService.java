package com.project.NetworkApp.Service;

import com.project.NetworkApp.DTO.AssignedAssetsResponseDTO;
import java.util.List;
public interface AssignedAssetsService {
    List<AssignedAssetsResponseDTO> getAssetsAssignedToCustomer(Integer customerId);
}