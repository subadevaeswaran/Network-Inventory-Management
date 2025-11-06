package com.project.NetworkApp.controller;

// package com.project.NetworkApp.controller;

import com.project.NetworkApp.DTO.CustomerDTO;
import com.project.NetworkApp.Service.CustomerService;
import com.project.NetworkApp.enums.CustomerStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for managing Customers.
 * This class exposes endpoints for CRUD operations on customers.
 */
@RestController
@RequestMapping("/customer") // Base URL for all customer-related APIs
@CrossOrigin("http://localhost:5173")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    /**
     * POST /customer
     * Creates a new customer profile.
     * Corresponds to US 1.1.
     */
    @PostMapping
    public ResponseEntity<CustomerDTO> createCustomer(@RequestBody CustomerDTO customerDTO) {
        CustomerDTO createdCustomer = customerService.createCustomer(customerDTO);
        return new ResponseEntity<>(createdCustomer, HttpStatus.CREATED);
    }

    /**
     * GET /customer
     * Retrieves a list of all customers.
     */
    @GetMapping
    public ResponseEntity<List<CustomerDTO>> getAllCustomers() {
        List<CustomerDTO> customers = customerService.getAllCustomers();
        return ResponseEntity.ok(customers);
    }

    /**
     * GET /customer/{id}
     * Views a specific customer's profile.
     * Corresponds to SRS 2.1.
     */
    @GetMapping("/{id}")
    public ResponseEntity<CustomerDTO> getCustomerById(@PathVariable Integer id) {
        CustomerDTO customer = customerService.getCustomerById(id);
        return ResponseEntity.ok(customer);
    }

    /**
     * PUT /customer/{id}
     * Updates an existing customer's profile.
     * Corresponds to SRS 2.1.
     */
    @PutMapping("/{id}")
    public ResponseEntity<CustomerDTO> updateCustomer(@PathVariable Integer id, @RequestBody CustomerDTO customerDTO) {
        CustomerDTO updatedCustomer = customerService.updateCustomer(id, customerDTO);
        return ResponseEntity.ok(updatedCustomer);
    }

    /**
     * DELETE /customer/{id}
     * Deactivates a customer (soft delete).
     * Corresponds to SRS 2.1 and US 5.1.
     */


    @GetMapping("/by-status")
    public ResponseEntity<List<CustomerDTO>> getCustomersByStatus(@RequestParam CustomerStatus status) {
        List<CustomerDTO> customers = customerService.getCustomersByStatus(status);
        return ResponseEntity.ok(customers);
    }

    @GetMapping("/cs")
    public ResponseEntity<List<CustomerDTO>> getCustomers(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) CustomerStatus status
    ) {
        // Pass filters (which can be null) to the service
        List<CustomerDTO> customers = customerService.getCustomers(city, status);
        return ResponseEntity.ok(customers);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivateCustomer(@PathVariable Integer id,
                                                   @RequestParam Integer operatorId) {
        // No @RequestParam needed
        customerService.deactivateCustomer(id,operatorId);
        return ResponseEntity.noContent().build();
    }
}