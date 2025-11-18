package com.project.NetworkApp.Service;



 import com.project.NetworkApp.DTO.CustomerDTO;
 import com.project.NetworkApp.Repository.*;
 import com.project.NetworkApp.Utility.CustomerUtility;
 import com.project.NetworkApp.entity.*;
 import com.project.NetworkApp.enums.AssetStatus;
 import com.project.NetworkApp.enums.CustomerStatus;
 import com.project.NetworkApp.exception.AssetNotFoundException;
 import com.project.NetworkApp.exception.CustomerNotFoundException;

import lombok.RequiredArgsConstructor;

 import org.slf4j.Logger;
 import org.slf4j.LoggerFactory;
 import org.springframework.stereotype.Service;

 import org.springframework.transaction.annotation.Transactional;
 import org.springframework.util.StringUtils;

 import java.util.ArrayList;
 import java.util.List;


@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;
    private final SplitterRepository splitterRepository; // Still needed to pass to the utility
    private final AuditLogService auditLogService;
    private final AssignedAssetsRepository assignedAssetsRepository;
    private final AssetRepository assetRepository;
    private static final Logger log = LoggerFactory.getLogger(CustomerServiceImpl.class);




    @Override
    public CustomerDTO createCustomer(CustomerDTO customerDTO) {
        Customer customer = CustomerUtility.toEntity(customerDTO, splitterRepository);
        Customer savedCustomer = customerRepository.save(customer);

        String description = "Created new customer profile for '" + savedCustomer.getName() + "' (ID: " + savedCustomer.getId() + ")";
        auditLogService.logAction("CUSTOMER_CREATE", description, customerDTO.operatorId());
        return CustomerUtility.toDTO(savedCustomer);
    }

    @Override
    public CustomerDTO getCustomerById(Integer id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new CustomerNotFoundException("Customer not found with id: " + id));
        return CustomerUtility.toDTO(customer);
    }

    @Override
    public List<CustomerDTO> getAllCustomers() {
        return customerRepository.findAll().stream()
                .map(CustomerUtility::toDTO) // Using a method reference
                .toList();
    }

    @Override
    public CustomerDTO updateCustomer(Integer id, CustomerDTO customerDTO) {

        // 1. Find the EXISTING customer from the database
        Customer existingCustomer = customerRepository.findById(id)
                .orElseThrow(() -> new CustomerNotFoundException("Exsisting Customer not found with id: " + id));

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
                    .orElseThrow(() -> new AssetNotFoundException("Splitter not found with id: " + customerDTO.splitterId()));
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
    @Transactional
    public void deactivateCustomer(Integer id, Integer operatorId) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new CustomerNotFoundException("Customer not found with id: " + id));


        // Check if already inactive
        if (customer.getStatus() == CustomerStatus.INACTIVE) {
            log.info("Customer {} is already inactive. No action taken.", id);
            return; // Nothing to do
        }

        List<String> reclaimedAssetsSerials = new ArrayList<>();
        String splitterInfo = "No splitter was assigned.";

        // 2. Find and update the associated Splitter (if one is assigned)
        Splitter splitter = customer.getSplitter();
        if (splitter != null) {
            int usedPorts = splitter.getUsedPorts();
            if (usedPorts > 0) {
                splitter.setUsedPorts(usedPorts - 1); // Decrement port count
                splitterRepository.save(splitter);
                splitterInfo = "Freed up port " + customer.getAssignedPort() + " on Splitter ID: " + splitter.getId();
            }
        }

        // 3. Find all AssignedAssets (ONT, Router) linked to this customer
        List<AssignedAssets> assignments = assignedAssetsRepository.findByCustomer_Id(id);

        for (AssignedAssets assignment : assignments) {
            Asset asset = assignment.getAsset();
            if (asset != null) {
                // 4. Update the Asset status back to AVAILABLE
                asset.setStatus(AssetStatus.AVAILABLE);
                asset.setAssignedToCustomerId(null); // Clear assignment
                asset.setAssignedDate(null);         // Clear assignment date
                assetRepository.save(asset);

                reclaimedAssetsSerials.add(asset.getSerialNumber()); // For logging
            }
            // 5. Delete the link from the assigned_assets table
            assignedAssetsRepository.delete(assignment);
        }

        // 6. Update the Customer's status
        customer.setStatus(CustomerStatus.INACTIVE);
        customer.setAssignedPort(0);   // Set port to 0 (or null if your column allows)
        customer.setSplitter(null);  // Remove the link to the splitter
        customerRepository.save(customer);


        // 7. Log the deactivation
        String description = "Deactivated Customer: " + customer.getName() + " (ID: " + customer.getId() + "). "
                + "Reclaimed assets: " + String.join(", ", reclaimedAssetsSerials) + ". "
                + splitterInfo;
        // Pass null for userId until security is implemented
        auditLogService.logAction("CUSTOMER_DEACTIVATE", description,operatorId);
    }

 

    @Override
    public List<CustomerDTO> getCustomersByStatus(CustomerStatus status) {
        List<Customer> customers = customerRepository.findByStatus(status);
        return customers.stream()
                .map(CustomerUtility::toDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CustomerDTO> getCustomers(String city, CustomerStatus status) {
        List<Customer> customers;

        // Convert "ALL" string/null to actual nulls for logic
        boolean hasCityFilter = StringUtils.hasText(city) && !"ALL".equalsIgnoreCase(city);
        boolean hasStatusFilter = status != null; // Enum will be null if not provided or invalid

        if (hasCityFilter && hasStatusFilter) {
            customers = customerRepository.findByCityAndStatus(city, status);
        } else if (hasCityFilter) {
            customers = customerRepository.findByCity(city);
        } else if (hasStatusFilter) {
            customers = customerRepository.findByStatus(status);
        } else {
            customers = customerRepository.findAll();
        }

        return customers.stream()
                .map(CustomerUtility::toDTO) // Use your existing utility
                .toList();
    }
}