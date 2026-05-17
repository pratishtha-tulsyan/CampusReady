package com.campusready.campusready.service;

import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.campusready.campusready.dto.BadgeResponseDTO;
import com.campusready.campusready.dto.LeaderboardEntryDTO;
import com.campusready.campusready.entity.Progress;
import com.campusready.campusready.entity.Quiz;
import com.campusready.campusready.entity.QuizAttempt;
import com.campusready.campusready.entity.User;
import com.campusready.campusready.repository.ProgressRepository;
import com.campusready.campusready.repository.QuizAttemptRepository;
import com.campusready.campusready.repository.QuizRepository;
import com.campusready.campusready.repository.UserRepository;

@Service
public class LeaderboardService {

    private final UserRepository userRepository;
    private final ProgressRepository progressRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final QuizRepository quizRepository;

    public LeaderboardService(
            UserRepository userRepository,
            ProgressRepository progressRepository,
            QuizAttemptRepository quizAttemptRepository,
            QuizRepository quizRepository
    ) {
        this.userRepository = userRepository;
        this.progressRepository = progressRepository;
        this.quizAttemptRepository = quizAttemptRepository;
        this.quizRepository = quizRepository;
    }

    public List<LeaderboardEntryDTO> getLeaderboard() {
        // List<User> users = userRepository.findAll();
        // return users.stream()
        //         .map(this::buildLeaderboardEntry)
        //         .sorted(Comparator.comparingInt(LeaderboardEntryDTO::getTotalPoints).reversed())
        //         .collect(Collectors.toList());
        List<User> users = userRepository.findAll();

return users.stream()
        .filter(user -> !"ADMIN".equalsIgnoreCase(user.getRole()))
        .map(this::buildLeaderboardEntry)
        .sorted(Comparator.comparingInt(LeaderboardEntryDTO::getTotalPoints).reversed())
        .collect(Collectors.toList());
    }

    public BadgeResponseDTO getBadgesForUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        int completedModules = getCompletedModulesCount(userId);
        int passedQuizzes = getPassedQuizCount(userId);
        int totalPoints = calculatePoints(completedModules, passedQuizzes);
        List<String> badges = calculateBadges(userId, completedModules, passedQuizzes);

        return BadgeResponseDTO.builder()
                .userId(user.getId())
                .userName(user.getName())
                .totalPoints(totalPoints)
                .completedModules(completedModules)
                .passedQuizzes(passedQuizzes)
                .badges(badges)
                .build();
    }

    private LeaderboardEntryDTO buildLeaderboardEntry(User user) {
        int completedModules = getCompletedModulesCount(user.getId());
        int passedQuizzes = getPassedQuizCount(user.getId());
        int totalPoints = calculatePoints(completedModules, passedQuizzes);

        return LeaderboardEntryDTO.builder()
                .userId(user.getId())
                .userName(user.getName())
                .completedModules(completedModules)
                .passedQuizzes(passedQuizzes)
                .totalPoints(totalPoints)
                .build();
    }

    private int getCompletedModulesCount(Long userId) {
        return (int) progressRepository.findByUserId(userId).stream()
                .filter(Progress::getCompleted)
                .count();
    }

    private int getPassedQuizCount(Long userId) {
        Set<Long> passedQuizIds = quizAttemptRepository.findByUserId(userId).stream()
                .filter(QuizAttempt::getPassed)
                .map(QuizAttempt::getQuizId)
                .collect(Collectors.toSet());
        return passedQuizIds.size();
    }

    private int calculatePoints(int completedModules, int passedQuizzes) {
        return completedModules * 10 + passedQuizzes * 20;
    }

    private List<String> calculateBadges(Long userId, int completedModules, int passedQuizzes) {
        List<String> badges = new java.util.ArrayList<>();
        if (completedModules >= 1) {
            badges.add("Beginner Responder");
        }
        if (completedModules >= 5) {
            badges.add("Safety Champion");
        }

        long totalQuizzes = quizRepository.count();
        if (totalQuizzes > 0 && passedQuizzes == totalQuizzes) {
            badges.add("Disaster Expert");
        }

        return badges;
    }
}
