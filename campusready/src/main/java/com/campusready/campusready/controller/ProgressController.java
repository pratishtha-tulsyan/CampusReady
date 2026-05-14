package com.campusready.campusready.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.campusready.campusready.entity.Progress;
import com.campusready.campusready.service.ProgressService;

@RestController
@RequestMapping("/progress")
public class ProgressController {

    private final ProgressService progressService;

    public ProgressController(ProgressService progressService) {
        this.progressService = progressService;
    }

    @PostMapping("/complete")
    public Progress completeModule(@RequestBody Progress progress) {
        return progressService.completeModule(progress);
    }

    @GetMapping("/user/{userId}")
    public List<Progress> getProgressByUser(@PathVariable Long userId) {
        return progressService.getProgressByUser(userId);
    }
}