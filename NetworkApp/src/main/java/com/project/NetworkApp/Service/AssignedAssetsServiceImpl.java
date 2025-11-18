package com.project.NetworkApp.Service;

import com.project.NetworkApp.DTO.AssignedAssetsResponseDTO;
import com.project.NetworkApp.entity.AssignedAssets;
import com.project.NetworkApp.Repository.AssignedAssetsRepository;
import com.project.NetworkApp.Utility.AssignedAssetsUtility; // Import utility
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;


@Service
@RequiredArgsConstructor
public class AssignedAssetsServiceImpl implements AssignedAssetsService {
    private final AssignedAssetsRepository assignedAssetsRepository;

    @Override
    public List<AssignedAssetsResponseDTO> getAssetsAssignedToCustomer(Integer customerId) {
        // Find links by customer ID (Need to add this method to the repository)
        List<AssignedAssets> assignments = assignedAssetsRepository.findByCustomer_Id(customerId);
        return assignments.stream()
                .map(AssignedAssetsUtility::toDTO)
                .toList();
    }
}
