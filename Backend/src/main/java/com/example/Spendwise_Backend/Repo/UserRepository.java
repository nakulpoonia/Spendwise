package com.example.Spendwise_Backend.Repo;

import com.example.Spendwise_Backend.Entity.user.User;
import com.example.Spendwise_Backend.Projection.UserSummary;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<UserSummary> findProjectedById(Long id);

    Optional<User> findByEmail(String email);
}