package com.project.NetworkApp.Service;

import com.project.NetworkApp.DTO.AuditLogResponseDTO;
import com.project.NetworkApp.Repository.UserRepository;
import com.project.NetworkApp.Utility.AuditLogUtility;
import com.project.NetworkApp.entity.AuditLog;
import com.project.NetworkApp.entity.User;
import com.project.NetworkApp.Repository.AuditLogRepository; // Create this repository
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    private final Map<Integer, String> usernameCache = new ConcurrentHashMap<>();

    @Override
    // Run in a new transaction so logging succeeds even if the main action fails later
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logAction(String actionType, String description, Integer userId) {
        try {
            AuditLog logEntry = new AuditLog();
            logEntry.setUserId(userId); // Can be null
            logEntry.setActionType(actionType);
            logEntry.setDescription(description);
            logEntry.setTimestamp(LocalDateTime.now()); // Set timestamp automatically
            auditLogRepository.save(logEntry);
        } catch (Exception e) {
            // Log the error but don't let it stop the main operation
            System.err.println("!!! Failed to save audit log: " + e.getMessage());
            // Consider using a proper logger here (like SLF4j)
        }
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logAction(String actionType, String description, User user) {
        logAction(actionType, description, (user != null ? user.getId() : null));
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditLogResponseDTO> getAllLogs() {
        // Fetch logs, sort by timestamp descending
        List<AuditLog> logs = auditLogRepository.findAll(Sort.by(Sort.Direction.DESC, "timestamp"));

        // Create a function to find usernames (using cache)
        Function<Integer, String> usernameFinder = userId -> usernameCache.computeIfAbsent(userId, id ->
                userRepository.findById(id)
                        .map(User::getUsername)
                        .orElse("ID:" + id) // Fallback if user deleted/not found
        );

        // Map entities to DTOs, passing the userRepository to the utility
        return logs.stream()
                .map(log -> AuditLogUtility.toDTO(log, userRepository)) // <-- Pass repository
                .collect(Collectors.toList());
    }
}
