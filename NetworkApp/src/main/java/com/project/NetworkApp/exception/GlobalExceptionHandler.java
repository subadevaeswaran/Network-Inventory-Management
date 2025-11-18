package com.project.NetworkApp.exception;



import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;


import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handles the "No user with this name" error.
     * Returns a 404 Not Found.
     */

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    private static final String message = "message";

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleEntityNotFound(EntityNotFoundException ex) {
        return new ResponseEntity<>(
                Map.of(message, ex.getMessage()),
                HttpStatus.NOT_FOUND
        );
    }

    /**
     * Handles "Incorrect password" or "Role mismatch" errors.
     * Returns a 401 Unauthorized.
     */
    @ExceptionHandler(SecurityException.class)
    public ResponseEntity<Map<String, String>> handleSecurityException(SecurityException ex) {
        return new ResponseEntity<>(
                Map.of(message, ex.getMessage()),
                HttpStatus.UNAUTHORIZED
        );
    }


    @ExceptionHandler(InvalidParameterException.class)
    public ResponseEntity<String> handleInvalidParam(InvalidParameterException ex) {
        return ResponseEntity.badRequest().body(ex.getMessage());
    }

    @ExceptionHandler(AssetNotFoundException.class)
    public ResponseEntity<String> handleAssetNotFound(AssetNotFoundException ex) {
        logger.error("Asset not found: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }

    @ExceptionHandler(InvalidAssetException.class)
    public ResponseEntity<String> handleInvalidAsset(InvalidAssetException ex) {
        logger.warn("Invalid asset operation: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
    }

    @ExceptionHandler(AssetDeleteException.class)
    public ResponseEntity<String> handleAssetDelete(AssetDeleteException ex) {
        logger.error("Error deleting asset: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
    }

    @ExceptionHandler(RoleNotValidException.class)
    public ResponseEntity<String> handleRoleNotValidException(RoleNotValidException ex) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ex.getMessage());
    }
}