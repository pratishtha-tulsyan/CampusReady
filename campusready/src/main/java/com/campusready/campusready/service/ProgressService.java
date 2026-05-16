package com.campusready.campusready.service;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.campusready.campusready.entity.Progress;
import com.campusready.campusready.entity.User;
import com.campusready.campusready.repository.ProgressRepository;
import com.campusready.campusready.repository.UserRepository;

@Service
public class ProgressService {

    private final ProgressRepository progressRepository;
    private final UserRepository userRepository;

    public ProgressService(
            ProgressRepository progressRepository,
            UserRepository userRepository
    ) {
        this.progressRepository = progressRepository;
        this.userRepository = userRepository;
    }

    public Progress completeModule(
            Progress progress,
            Authentication authentication
    ) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        progress.setUserId(user.getId());

        return progressRepository
                .findByUserIdAndModuleId(
                        progress.getUserId(),
                        progress.getModuleId()
                )
                .orElseGet(() -> progressRepository.save(progress));
    }

    public List<Progress> getMyProgress(Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return progressRepository.findByUserId(user.getId());
    }
}