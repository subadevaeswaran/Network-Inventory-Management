package com.project.NetworkApp.Service;

/// package com.example.inventory.service;

 import com.project.NetworkApp.DTO.CustomerDTO;
 import com.project.NetworkApp.Repository.CustomerRepository;
 import com.project.NetworkApp.Repository.SplitterRepository;
 import com.project.NetworkApp.Utility.CustomerUtility;
 import com.project.NetworkApp.entity.Customer;
 import com.project.NetworkApp.entity.Splitter;
 import com.project.NetworkApp.enums.CustomerStatus;
 import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
 import org.springframework.beans.factory.annotation.Autowired;
 import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {
    @Autowired
    private CustomerRepository customerRepository;
    @Autowired
    private SplitterRepository splitterRepository; // Still needed to pass to the utility

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

        // 1. Find the EXISTING customer from the database
        Customer existingCustomer = customerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Customer not found with id: " + id));

        // 2. Update the fields on the EXISTING entity
        existingCustomer.setName(customerDTO.name());
        existingCustomer.setAddress(customerDTO.address());
        existingCustomer.setNeighborhood(customerDTO.neighborhood());
        existingCustomer.setPlan(customerDTO.plan());
        existingCustomer.setConnectionType(customerDTO.connectionType());
        existingCustomer.setStatus(customerDTO.status());
        existingCustomer.setAssignedPort(customerDTO.assignedPort());

        // 3. Update the relationships on the EXISTING entity
        if (customerDTO.splitterId() != null) {
            Splitter splitter = splitterRepository.findById(customerDTO.splitterId())
                    .orElseThrow(() -> new EntityNotFoundException("Splitter not found with id: " + customerDTO.splitterId()));
            existingCustomer.setSplitter(splitter);
        } else {
            existingCustomer.setSplitter(null);
        }

        // 4. Save the MODIFIED entity.
        // This preserves the .assignedAssets collection and avoids the error.
        Customer updatedCustomer = customerRepository.save(existingCustomer);

        return CustomerUtility.toDTO(updatedCustomer);
    }

    @Override
    public void deactivateCustomer(Integer id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Customer not found with id: " + id));
        customer.setStatus(CustomerStatus.INACTIVE);
        customerRepository.save(customer);
    }

    @Override
    public List<CustomerDTO> getCustomersByStatus(CustomerStatus status) {
        List<Customer> customers = customerRepository.findByStatus(status);
        return customers.stream()
                .map(CustomerUtility::toDTO)
                .collect(Collectors.toList());
    }
}