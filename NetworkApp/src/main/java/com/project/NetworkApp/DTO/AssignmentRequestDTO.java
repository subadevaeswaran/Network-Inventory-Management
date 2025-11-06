package com.project.NetworkApp.DTO;

import java.math.BigDecimal;

public record AssignmentRequestDTO(
        Integer customerId,
        Integer splitterId,
        int port,
        String neighborhood,
        BigDecimal fiberLengthMeters,// We'll update the customer with this
        Integer technicianId,
        Integer operatorId
) {
}