package com.project.NetworkApp.DTO;




import com.project.NetworkApp.enums.ConnectionType;
import com.project.NetworkApp.enums.CustomerStatus;

import java.time.LocalDateTime;

/**
 * DTO for transferring Customer data. This is the object that will be
 * sent and received in our REST API's request and response bodies.
 *
 * We use a Java 'record' for this because it's immutable and provides
 * constructor, getters, equals(), hashCode(), and toString() automatically.
 */
public record CustomerDTO(
        Integer id,
        String name,
        String address,
        String city,
        String neighborhood,
        String plan,
        ConnectionType connectionType,
        CustomerStatus status,
        int assignedPort,
        LocalDateTime createdAt,

        // We include the ID of the related entity, not the whole object.
        // This is a best practice for clean APIs.
        Integer splitterId,
        String splitterModel, // <-- ADD THIS
        String fdhName ,
        Integer operatorId
) {
}