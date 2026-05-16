package com.campusready.campusready.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CertificateVerifyDTO {
    private String certificateCode;
    private String userName;
    private String userEmail;
    private Integer completionPercentage;
    private LocalDateTime issuedAt;
    private boolean valid;
}
