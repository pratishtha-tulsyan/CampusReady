package com.campusready.campusready.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.campusready.campusready.dto.BadgeResponseDTO;
import com.campusready.campusready.dto.LeaderboardEntryDTO;
import com.campusready.campusready.entity.User;
import com.campusready.campusready.repository.UserRepository;
import com.campusready.campusready.service.LeaderboardService;

@RestController
@RequestMapping("/leaderboard")
public class LeaderboardController {

    private final LeaderboardService leaderboardService;
    private final UserRepository userRepository;

    public LeaderboardController(LeaderboardService leaderboardService, UserRepository userRepository) {
        this.leaderboardService = leaderboardService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<LeaderboardEntryDTO> getLeaderboard() {
        return leaderboardService.getLeaderboard();
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyBadges(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "User not authenticated"));
        }

        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        BadgeResponseDTO badges = leaderboardService.getBadgesForUser(user.getId());
        return ResponseEntity.ok(badges);
    }
}
