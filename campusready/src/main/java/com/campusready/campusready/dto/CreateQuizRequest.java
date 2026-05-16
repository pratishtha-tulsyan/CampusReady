package com.campusready.campusready.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateQuizRequest {
    private Long moduleId;
    private String title;
    private String description;
    private Integer passingScore;
}
