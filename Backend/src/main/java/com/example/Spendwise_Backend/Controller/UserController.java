package com.example.Spendwise_Backend.Controller;

import com.example.Spendwise_Backend.Entity.user.User;
import com.example.Spendwise_Backend.Projection.UserSummary;
import com.example.Spendwise_Backend.Request.UpdateUserRequest;
import com.example.Spendwise_Backend.Response.UserResponse;
import com.example.Spendwise_Backend.Service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService){
        this.userService=userService;
    }

    @GetMapping("/me")
    public UserSummary getCurrentUser() {
        return userService.getCurrentUser();
    }

    @PutMapping("/me")
    public UserResponse updateCurrentUser(
            @Valid @RequestBody UpdateUserRequest request
    ) {
        User updatedUser = userService.updateCurrentUser(
                request.getName(),
                request.getCurrency()
        );

        return new UserResponse(
                updatedUser.getId(),
                updatedUser.getName(),
                updatedUser.getEmail(),
                updatedUser.getCurrency()
        );
    }


}
