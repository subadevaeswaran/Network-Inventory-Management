package com.project.NetworkApp.Utility;

// package com.example.inventory.util;

import com.project.NetworkApp.DTO.CustomerDTO;
import com.project.NetworkApp.Repository.SplitterRepository;
import com.project.NetworkApp.entity.Customer;
import com.project.NetworkApp.entity.Splitter;
import jakarta.persistence.EntityNotFoundException;

/**
 * A plain utility class with static methods for mapping between
 * Customer entities and DTOs.
 */
public final class CustomerUtility {

    /**
     * A private constructor to prevent this utility class from being instantiated.
     */
    private CustomerUtility() {}

    /**
     * Converts a Customer entity to a CustomerDTO.
     * This method is self-contained and has no dependencies.
     *
     * @param customer The Customer entity to convert.
     * @return The resulting CustomerDTO.
     */
    public static CustomerDTO toDTO(Customer customer) {
        if (customer == null) {
            return null;
        }

        return new CustomerDTO(
                customer.getId(),
                customer.getName(),
                customer.getAddress(),
                customer.getNeighborhood(),
                customer.getPlan(),
                customer.getConnectionType(),
                customer.getStatus(),
                customer.getAssignedPort(),
                customer.getCreatedAt(),
                customer.getSplitter() != null ? customer.getSplitter().getId() : null
        );
    }

    /**
     * Converts a CustomerDTO to a Customer entity.
     *
     * @param dto The CustomerDTO to convert.
     * @param splitterRepository A repository instance needed to find the associated Splitter.
     * @return The resulting Customer entity.
     */
    public static Customer toEntity(CustomerDTO dto, SplitterRepository splitterRepository) {
        Customer customer = new Customer();
        customer.setName(dto.name());
        customer.setAddress(dto.address());
        customer.setNeighborhood(dto.neighborhood());
        customer.setPlan(dto.plan());
        customer.setConnectionType(dto.connectionType());
        customer.setStatus(dto.status());
        customer.setAssignedPort(dto.assignedPort());

        // Use the passed-in repository to find and link the Splitter
        if (dto.splitterId() != null) {
            Splitter splitter = splitterRepository.findById(dto.splitterId())
                    .orElseThrow(() -> new EntityNotFoundException("Splitter not found with id: " + dto.splitterId()));
            customer.setSplitter(splitter);
        }

        return customer;
    }
}