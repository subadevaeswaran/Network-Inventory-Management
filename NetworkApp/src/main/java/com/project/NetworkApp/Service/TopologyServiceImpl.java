package com.project.NetworkApp.Service;

import com.project.NetworkApp.DTO.TopologyNodeDTO;
import com.project.NetworkApp.Repository.CustomerRepository;
import com.project.NetworkApp.entity.Customer;
import com.project.NetworkApp.entity.Fdh;
import com.project.NetworkApp.entity.Headend;
import com.project.NetworkApp.entity.Splitter;
import com.project.NetworkApp.Repository.FdhRepository;
import com.project.NetworkApp.Repository.HeadendRepository;
import com.project.NetworkApp.Repository.SplitterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;


import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TopologyServiceImpl implements TopologyService {

    private final CustomerRepository customerRepository; // Make sure this is injected
    private final HeadendRepository headendRepository;
    private final FdhRepository fdhRepository;
    private final SplitterRepository splitterRepository;

    @Override
    @Transactional(readOnly = true)
    public List<TopologyNodeDTO> getTopologyByCity(String city) {
        List<TopologyNodeDTO> nodes = new ArrayList<>();
        List<Headend> headends;

        // 1. Find Headends
        // Handle 'all' case or filter by specific city
        if ("all".equalsIgnoreCase(city) || !StringUtils.hasText(city)) { // Treat empty string like 'all'
            headends = headendRepository.findAll();
            System.out.println(">>> Fetching topology for ALL cities.");
        } else {
            // Assumes HeadendRepository has findByCity method
            headends = headendRepository.findByCity(city);
            System.out.println(">>> Fetching topology for city: " + city);
        }

        if (headends.isEmpty()) {
            System.out.println(">>> No headends found for the specified criteria.");
            return nodes; // Return empty list if no headends match
        }

        // --- Build Topology Node List ---
        for (Headend headend : headends) {
            String headendNodeId = "headend-" + headend.getId();
            List<String> fdhNodeIds = new ArrayList<>(); // Children of Headend
            Map<String, String> headendDetails = new HashMap<>();
            headendDetails.put("city", headend.getCity());
            headendDetails.put("location", headend.getLocation());
            nodes.add(new TopologyNodeDTO(headendNodeId, "Headend", headend.getName(), fdhNodeIds, headendDetails));

            // 2. Find FDHs for this Headend
            // Assumes FdhRepository has findByHeadendId method
            List<Fdh> fdhs = fdhRepository.findByHeadendId(headend.getId());
            for (Fdh fdh : fdhs) {
                String fdhNodeId = "fdh-" + fdh.getId();
                fdhNodeIds.add(fdhNodeId); // Link FDH to Headend
                List<String> splitterNodeIds = new ArrayList<>(); // Children of FDH
                Map<String, String> fdhDetails = new HashMap<>();
                fdhDetails.put("region", fdh.getRegion());
                fdhDetails.put("location", fdh.getLocation());
                fdhDetails.put("ports", fdh.getMaxPorts() + " max");
                nodes.add(new TopologyNodeDTO(fdhNodeId, "FDH", fdh.getName(), splitterNodeIds, fdhDetails));

                // 3. Find Splitters for this FDH
                List<Splitter> splitters = splitterRepository.findByFdhId(fdh.getId());
                for (Splitter splitter : splitters) {
                    String splitterNodeId = "splitter-" + splitter.getId();
                    splitterNodeIds.add(splitterNodeId); // Link Splitter to FDH
                    List<String> houseNodeIds = new ArrayList<>(); // Children of Splitter
                    Map<String, String> splitterDetails = new HashMap<>();
                    splitterDetails.put("ratio", "1:" + splitter.getPortCapacity());
                    splitterDetails.put("used", splitter.getUsedPorts() + "/" + splitter.getPortCapacity());
                    splitterDetails.put("location", splitter.getLocation());
                    // Add Splitter Node - initially with empty children list, will be updated below if needed
                    // We add it here to ensure it exists in the list before adding houses
                    TopologyNodeDTO splitterNode = new TopologyNodeDTO(splitterNodeId, "Splitter", splitter.getModel(), houseNodeIds, splitterDetails);
                    nodes.add(splitterNode);


                    // --- ** ADDED Customer/House Node Logic ** ---
                    // 4. Find Customers (Houses) connected to this Splitter
                    // Assumes CustomerRepository has findBySplitter_IdOrderByAssignedPortAsc method
                    List<Customer> customers = customerRepository.findBySplitter_IdOrderByAssignedPortAsc(splitter.getId());

                    // Generate neighborhood prefix (e.g., "A1" from "Neighborhood A1")
                    String neighborhoodPrefix = fdh.getRegion() != null ?
                            fdh.getRegion().replace("Neighborhood ", "").replace(" ", "") :
                            "N" + fdh.getId(); // Fallback prefix

                    for (Customer customer : customers) {
                        String houseNodeId = "customer-" + customer.getId();
                        houseNodeIds.add(houseNodeId); // Link house to splitter by adding to the list

                        // Generate name like "A1.1" using assigned port
                        String houseName = neighborhoodPrefix + "." + customer.getAssignedPort();

                        Map<String, String> houseDetails = new HashMap<>();
                        houseDetails.put("customerName", customer.getName());
                        houseDetails.put("address", customer.getAddress());
                        houseDetails.put("status", customer.getStatus().name());
                        houseDetails.put("plan", customer.getPlan());
                        // Add ONT/Router serial later if needed via another query (AssignedAssets)

                        // Add House Node to the main list
                        nodes.add(new TopologyNodeDTO(houseNodeId, "House", houseName, new ArrayList<>(), houseDetails)); // Houses have no children in this view
                    }
                    // --- ** End Customer/House Node Logic ** ---
                }
            }
        }
        System.out.println(">>> Returning " + nodes.size() + " topology nodes."); // Log count
        return nodes;
    }

    // Ensure these methods exist in respective repositories:
    // HeadendRepository: List<Headend> findByCity(String city);
    // FdhRepository: List<Fdh> findByHeadendId(Integer headendId);
    // SplitterRepository: List<Splitter> findByFdhId(Integer fdhId);
    // CustomerRepository: List<Customer> findBySplitter_IdOrderByAssignedPortAsc(Integer splitterId);
}