package com.project.NetworkApp.Repository;
import com.project.NetworkApp.entity.Customer;
import com.project.NetworkApp.enums.CustomerStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Integer> {

    List<Customer> findByNeighborhood(String neighborhood);

    List<Customer> findByCity(String city);
    List<Customer> findByCityAndStatus(String city, CustomerStatus status);

    long countBySplitter_Id(Integer splitterId);

    List<Customer> findByStatus(CustomerStatus status);

    List<Customer> findBySplitter_IdOrderByAssignedPortAsc(Integer splitterId);

}