package com.campusready.campusready.dto;

import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizSubmissionRequest {
    private Long quizId;
    private Map<Long, String> answers; // questionId -> selected answer (A, B, C, D)
}
