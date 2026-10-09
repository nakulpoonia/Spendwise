package com.example.Spendwise_Backend.Service;

import com.example.Spendwise_Backend.Entity.user.User;
import com.example.Spendwise_Backend.Exception.ResourceNotFoundException;
import com.example.Spendwise_Backend.Projection.UserSummary;
import com.example.Spendwise_Backend.Repo.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;

    public UserService(
            UserRepository userRepository,
            CurrentUserService currentUserService
    ) {
        this.userRepository = userRepository;
        this.currentUserService = currentUserService;
    }

    public UserSummary getCurrentUser() {

        Long userId = currentUserService.getCurrentUserId();

        return userRepository.findProjectedById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));
    }

    public User updateCurrentUser(
            String name,
            String currency
    ) {
        Long userId = currentUserService.getCurrentUserId();

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        user.setName(name);
        user.setCurrency(currency);

        return userRepository.save(user);
    }
}
