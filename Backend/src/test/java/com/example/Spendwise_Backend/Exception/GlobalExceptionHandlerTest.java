package com.example.Spendwise_Backend.Exception;

import com.example.Spendwise_Backend.Response.ErrorResponse;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void shouldHandleIllegalArgumentException() {

        IllegalArgumentException exception =
                new IllegalArgumentException("Invalid amount");

        ResponseEntity<ErrorResponse> response =
                handler.handleIllegalArgumentException(exception);

        assertEquals(HttpStatus.BAD_REQUEST.value(), response.getBody().getStatus());
        assertEquals("Invalid amount", response.getBody().getMessage());
        assertNotNull(response.getBody().getTimestamp());
    }

    @Test
    void shouldHandleValidationException() {

        BindingResult bindingResult = mock(BindingResult.class);

        FieldError fieldError =
                new FieldError(
                        "testRequest",
                        "name",
                        "",
                        false,
                        null,
                        null,
                        "Name is required"
                );

        when(bindingResult.getFieldErrors())
                .thenReturn(List.of(fieldError));

        MethodArgumentNotValidException exception =
                mock(MethodArgumentNotValidException.class);

        when(exception.getBindingResult())
                .thenReturn(bindingResult);

        ResponseEntity<ErrorResponse> response =
                handler.handleValidationException(exception);

        assertEquals(HttpStatus.BAD_REQUEST.value(), response.getBody().getStatus());
        assertEquals(
                "name: Name is required",
                response.getBody().getMessage()
        );
        assertNotNull(response.getBody().getTimestamp());
    }

    @Test
    void shouldHandleResourceNotFoundException() {

        ResourceNotFoundException exception =
                new ResourceNotFoundException("Account not found");

        ResponseEntity<ErrorResponse> response =
                handler.handleResourceNotFoundException(exception);

        assertEquals(HttpStatus.NOT_FOUND.value(), response.getBody().getStatus());
        assertEquals("Account not found", response.getBody().getMessage());
        assertNotNull(response.getBody().getTimestamp());
    }

    @Test
    void shouldHandleUnauthorizedException() {

        UnauthorizedException exception =
                new UnauthorizedException("Invalid credentials");

        ResponseEntity<ErrorResponse> response =
                handler.handleUnauthorizedException(exception);

        assertEquals(HttpStatus.UNAUTHORIZED.value(), response.getBody().getStatus());
        assertEquals("Invalid credentials", response.getBody().getMessage());
        assertNotNull(response.getBody().getTimestamp());
    }

    @Test
    void shouldHandleForbiddenException() {

        ForbiddenException exception =
                new ForbiddenException("Email not verified");

        ResponseEntity<ErrorResponse> response =
                handler.handleForbiddenException(exception);

        assertEquals(HttpStatus.FORBIDDEN.value(), response.getBody().getStatus());
        assertEquals("Email not verified", response.getBody().getMessage());
        assertNotNull(response.getBody().getTimestamp());
    }

    @Test
    void shouldHandleDataIntegrityViolationException() {

        DataIntegrityViolationException exception =
                new DataIntegrityViolationException("Duplicate entry");

        ResponseEntity<ErrorResponse> response =
                handler.handleDataIntegrityViolation(exception);

        assertEquals(HttpStatus.CONFLICT.value(), response.getBody().getStatus());
        assertEquals(
                "Database constraint violation",
                response.getBody().getMessage()
        );
        assertNotNull(response.getBody().getTimestamp());
    }
}