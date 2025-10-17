package com.project.NetworkApp.Service;

/// package com.example.inventory.service;

 import com.project.NetworkApp.DTO.CustomerDTO;
 import com.project.NetworkApp.Repository.CustomerRepository;
 import com.project.NetworkApp.Repository.SplitterRepository;
 import com.project.NetworkApp.Utility.CustomerUtility;
 import com.project.NetworkApp.entity.Customer;
 import com.project.NetworkApp.enums.CustomerStatus;
 import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;
    private final SplitterRepository splitterRepository; // Still needed to pass to the utility

    @Override
    public CustomerDTO createCustomer(CustomerDTO customerDTO) {
        // Pass the repository to the utility method
        Customer customer = CustomerUtility.toEntity(customerDTO, splitterRepository);
        Customer savedCustomer = customerRepository.save(customer);
        return CustomerUtility.toDTO(savedCustomer);
    }

    @Override
    public CustomerDTO getCustomerById(Integer id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Customer not found with id: " + id));
        return CustomerUtility.toDTO(customer);
    }

    @Override
    public List<CustomerDTO> getAllCustomers() {
        return customerRepository.findAll().stream()
                .map(CustomerUtility::toDTO) // Using a method reference
                .collect(Collectors.toList());
    }

    @Override
    public CustomerDTO updateCustomer(Integer id, CustomerDTO customerDTO) {
        // Ensure the customer exists before proceeding
        if (!customerRepository.existsById(id)) {
            throw new EntityNotFoundException("Customer not found with id: " + id);
        }

        Customer customerToUpdate = CustomerUtility.toEntity(customerDTO, splitterRepository);
        customerToUpdate.setId(id); // Set the ID to ensure an update, not an insert

        Customer updatedCustomer = customerRepository.save(customerToUpdate);
        return CustomerUtility.toDTO(updatedCustomer);
    }

    @Override
    public void deactivateCustomer(Integer id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Customer not found with id: " + id));
        customer.setStatus(CustomerStatus.INACTIVE);
        customerRepository.save(customer);
    }
}