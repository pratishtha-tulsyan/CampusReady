package com.campusready.campusready.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BadgeResponseDTO {
    private Long userId;
    private String userName;
    private Integer totalPoints;
    private Integer completedModules;
    private Integer passedQuizzes;
    private List<String> badges;
}
