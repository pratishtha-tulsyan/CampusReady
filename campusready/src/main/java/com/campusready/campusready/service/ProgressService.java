package com.campusready.campusready.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.campusready.campusready.entity.Progress;
import com.campusready.campusready.repository.ProgressRepository;

@Service
public class ProgressService {

    private final ProgressRepository progressRepository;

    public ProgressService(ProgressRepository progressRepository) {
        this.progressRepository = progressRepository;
    }

    public Progress completeModule(Progress progress) {
        return progressRepository.findByUserIdAndModuleId(progress.getUserId(), progress.getModuleId())
                .orElseGet(() -> progressRepository.save(progress));
    }

    public List<Progress> getProgressByUser(Long userId) {
        return progressRepository.findByUserId(userId);
    }
}
