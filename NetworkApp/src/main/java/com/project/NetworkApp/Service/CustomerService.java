package com.project.NetworkApp.Service;

// package com.example.inventory.service;


import com.project.NetworkApp.DTO.CustomerDTO;
import com.project.NetworkApp.enums.CustomerStatus;

import java.util.List;

/**
 * Interface for customer-related business logic.
 * This defines the contract for our Customer service, outlining the operations
 * that can be performed.
 */
public interface CustomerService {

    /**
     * Creates a new customer.
     * @param customerDTO The DTO containing the new customer's data.
     * @return The DTO of the newly created customer.
     */
    CustomerDTO createCustomer(CustomerDTO customerDTO);

    /**
     * Retrieves a customer by their ID.
     * @param id The ID of the customer to retrieve.
     * @return The DTO of the found customer, or throws an exception if not found.
     */
    CustomerDTO getCustomerById(Integer id);

    /**
     * Retrieves all customers.
     * @return A list of all customer DTOs.
     */
    List<CustomerDTO> getAllCustomers();

    CustomerDTO updateCustomer(Integer id, CustomerDTO customerDTO);

    /**
     * Deactivates a customer (sets their status to INACTIVE).
     * @param id The ID of the customer to deactivate.
     */
    void deactivateCustomer(Integer id);

    List<CustomerDTO> getCustomersByStatus(CustomerStatus status);

    // We will add update and delete methods later.
}