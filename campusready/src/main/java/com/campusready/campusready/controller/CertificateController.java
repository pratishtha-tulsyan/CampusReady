package com.campusready.campusready.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.campusready.campusready.dto.CertificateResponseDTO;
import com.campusready.campusready.dto.CertificateVerifyDTO;
import com.campusready.campusready.service.CertificateService;

@RestController
@RequestMapping("/certificate")
public class CertificateController {

    private final CertificateService certificateService;

    public CertificateController(CertificateService certificateService) {
        this.certificateService = certificateService;
    }

    @GetMapping("/my")
    public CertificateResponseDTO getMyCertificate(Authentication authentication) {
        return certificateService.getMyCertificate(authentication);
    }

    @PostMapping("/generate")
    public CertificateResponseDTO generateCertificate(Authentication authentication) {
        return certificateService.generateCertificate(authentication);
    }

    @GetMapping("/my/pdf")
    public ResponseEntity<byte[]> downloadCertificatePdf(Authentication authentication) {
        byte[] pdfBytes = certificateService.getCertificatePdf(authentication);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=CampusReady-Certificate.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @GetMapping("/verify/{code}")
    public CertificateVerifyDTO verifyCertificate(@org.springframework.web.bind.annotation.PathVariable String code) {
        return certificateService.verifyCertificate(code);
    }
}
