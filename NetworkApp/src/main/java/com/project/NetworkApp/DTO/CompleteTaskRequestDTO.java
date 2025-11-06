package com.project.NetworkApp.DTO;



/**
 * DTO for receiving details needed to complete a deployment task.
 */
public record CompleteTaskRequestDTO(
        Integer ontAssetId,      // ID of the ONT Asset being assigned
        Integer routerAssetId,   // ID of the Router Asset being assigned
        String completionNotes,
        Integer operatorId
) {}