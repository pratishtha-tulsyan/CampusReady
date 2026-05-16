package com.campusready.campusready.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaderboardEntryDTO {
    private Long userId;
    private String userName;
    private Integer totalPoints;
    private Integer completedModules;
    private Integer passedQuizzes;
}
