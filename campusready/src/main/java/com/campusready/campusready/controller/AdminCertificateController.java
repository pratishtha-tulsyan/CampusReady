package com.campusready.campusready.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.campusready.campusready.dto.CertificateResponseDTO;
import com.campusready.campusready.service.CertificateService;

@RestController
@RequestMapping("/admin/certificates")
public class AdminCertificateController {

    private final CertificateService certificateService;

    public AdminCertificateController(CertificateService certificateService) {
        this.certificateService = certificateService;
    }

    @GetMapping
    public List<CertificateResponseDTO> getAllCertificates() {
        return certificateService.getAllCertificates();
    }
}
