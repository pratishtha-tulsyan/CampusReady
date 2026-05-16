package com.campusready.campusready.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizResultDTO {
    private Long attemptId;
    private Integer score; // Percentage
    private Integer correctAnswers;
    private Integer totalQuestions;
    private Boolean passed;
    private String message; // "Quiz Passed!" or "Quiz Failed. Try again."
}
