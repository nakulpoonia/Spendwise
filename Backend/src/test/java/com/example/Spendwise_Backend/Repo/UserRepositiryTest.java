package com.example.Spendwise_Backend.Repo;

import com.example.Spendwise_Backend.Entity.user.User;
import com.example.Spendwise_Backend.Projection.UserSummary;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.dao.DataIntegrityViolationException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    // =========================================================
    // SAVE + FIND BY ID
    // =========================================================

    @Test
    @DisplayName("Should save and find user")
    void shouldSaveAndFindUser() {

        User user = new User(
                "Nakul",
                "nakul" + System.currentTimeMillis() + "@test.com",
                "INR"
        );

        user.setPasswordHash("dummy-password-hash");

        User savedUser = userRepository.save(user);

        assertNotNull(savedUser.getId());

        Optional<User> foundUser =
                userRepository.findById(savedUser.getId());

        assertTrue(foundUser.isPresent());

        assertEquals("Nakul", foundUser.get().getName());
        assertEquals(savedUser.getEmail(), foundUser.get().getEmail());
        assertEquals("INR", foundUser.get().getCurrency());
        assertFalse(foundUser.get().isEmailVerified());
    }

    // =========================================================
    // FIND BY EMAIL
    // =========================================================

    @Test
    @DisplayName("Should find user by email")
    void shouldFindUserByEmail() {

        String email =
                "email" + System.currentTimeMillis() + "@test.com";

        User user = new User(
                "Nakul",
                email,
                "INR"
        );

        user.setPasswordHash("dummy-password-hash");

        userRepository.save(user);

        Optional<User> foundUser =
                userRepository.findByEmail(email);

        assertTrue(foundUser.isPresent());

        assertEquals(email, foundUser.get().getEmail());
        assertEquals("Nakul", foundUser.get().getName());
    }

    // =========================================================
    // FIND BY EMAIL - NOT FOUND
    // =========================================================

    @Test
    @DisplayName("Should return empty when email does not exist")
    void shouldReturnEmptyWhenEmailDoesNotExist() {

        Optional<User> foundUser =
                userRepository.findByEmail(
                        "doesnotexist" + System.currentTimeMillis() + "@test.com"
                );

        assertTrue(foundUser.isEmpty());
    }

    // =========================================================
    // DUPLICATE EMAIL
    // =========================================================

    @Test
    @DisplayName("Should reject duplicate email")
    void shouldRejectDuplicateEmail() {

        String email =
                "duplicate" + System.currentTimeMillis() + "@test.com";

        User firstUser = new User(
                "Nakul",
                email,
                "INR"
        );

        firstUser.setPasswordHash("dummy-password-hash");

        userRepository.saveAndFlush(firstUser);

        User secondUser = new User(
                "Another User",
                email,
                "INR"
        );

        secondUser.setPasswordHash("dummy-password-hash");

        assertThrows(
                DataIntegrityViolationException.class,
                () -> userRepository.saveAndFlush(secondUser)
        );
    }

    // =========================================================
    // USER PROJECTION
    // =========================================================

    @Test
    @DisplayName("Should find user projection by ID")
    void shouldFindUserProjectionById() {

        User user = new User(
                "Nakul",
                "projection" + System.currentTimeMillis() + "@test.com",
                "INR"
        );

        user.setPasswordHash("dummy-password-hash");

        User savedUser = userRepository.save(user);

        Optional<UserSummary> projection =
                userRepository.findProjectedById(savedUser.getId());

        assertTrue(projection.isPresent());

        assertEquals(savedUser.getId(), projection.get().getId());
        assertEquals("Nakul", projection.get().getName());
        assertEquals(savedUser.getEmail(), projection.get().getEmail());
        assertEquals("INR", projection.get().getCurrency());
    }

    // =========================================================
    // PROJECTION - NOT FOUND
    // =========================================================

    @Test
    @DisplayName("Should return empty projection for unknown ID")
    void shouldReturnEmptyProjectionForUnknownId() {

        Optional<UserSummary> projection =
                userRepository.findProjectedById(999999L);

        assertTrue(projection.isEmpty());
    }
}