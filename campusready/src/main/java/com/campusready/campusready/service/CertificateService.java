package com.campusready.campusready.service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.campusready.campusready.dto.CertificateResponseDTO;
import com.campusready.campusready.dto.CertificateVerifyDTO;
import com.campusready.campusready.entity.Certificate;
import com.campusready.campusready.entity.Progress;
import com.campusready.campusready.entity.QuizAttempt;
import com.campusready.campusready.entity.Quiz;
import com.campusready.campusready.entity.User;
import com.campusready.campusready.repository.CertificateRepository;
import com.campusready.campusready.repository.ModuleRepository;
import com.campusready.campusready.repository.ProgressRepository;
import com.campusready.campusready.repository.QuizAttemptRepository;
import com.campusready.campusready.repository.QuizRepository;
import com.campusready.campusready.repository.UserRepository;

@Service
public class CertificateService {

    private final CertificateRepository certificateRepository;
    private final UserRepository userRepository;
    private final ProgressRepository progressRepository;
    private final ModuleRepository moduleRepository;
    private final QuizRepository quizRepository;
    private final QuizAttemptRepository quizAttemptRepository;

    public CertificateService(
            CertificateRepository certificateRepository,
            UserRepository userRepository,
            ProgressRepository progressRepository,
            ModuleRepository moduleRepository,
            QuizRepository quizRepository,
            QuizAttemptRepository quizAttemptRepository
    ) {
        this.certificateRepository = certificateRepository;
        this.userRepository = userRepository;
        this.progressRepository = progressRepository;
        this.moduleRepository = moduleRepository;
        this.quizRepository = quizRepository;
        this.quizAttemptRepository = quizAttemptRepository;
    }

    public CertificateResponseDTO getMyCertificate(Authentication authentication) {
        User user = getUser(authentication);
        Certificate certificate = certificateRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Certificate not found"));

        return toResponseDto(certificate, user);
    }

    public CertificateResponseDTO generateCertificate(Authentication authentication) {
        User user = getUser(authentication);
        Optional<Certificate> existing = certificateRepository.findByUserId(user.getId());
        if (existing.isPresent()) {
            return toResponseDto(existing.get(), user);
        }

        long totalModules = moduleRepository.count();
        List<Progress> progress = progressRepository.findByUserId(user.getId());
        long completedModules = progress.stream().filter(Progress::getCompleted).count();

        long totalQuizzes = quizRepository.count();
        Set<Long> passedQuizIds = quizAttemptRepository.findByUserIdAndPassedTrue(user.getId()).stream()
                .map(QuizAttempt::getQuizId)
                .collect(Collectors.toSet());
        long passedQuizzes = passedQuizIds.size();

        boolean eligible = (totalModules > 0 && completedModules == totalModules)
                || (totalQuizzes > 0 && passedQuizzes == totalQuizzes);

        if (!eligible) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Certificate requirements are not complete yet.");
        }

        int completionPercentage = calculateCompletionPercentage(totalModules, completedModules, totalQuizzes, passedQuizzes);
        Certificate certificate = Certificate.builder()
                .userId(user.getId())
                .certificateCode(generateUniqueCertificateCode())
                .completionPercentage(completionPercentage)
                .issuedAt(LocalDateTime.now())
                .build();

        return toResponseDto(certificateRepository.save(certificate), user);
    }

    public byte[] getCertificatePdf(Authentication authentication) {
        User user = getUser(authentication);
        Certificate certificate = certificateRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Certificate not found"));

        return createCertificatePdf(certificate, user);
    }

    public CertificateVerifyDTO verifyCertificate(String code) {
        Certificate certificate = certificateRepository.findByCertificateCode(code)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Certificate code not found"));

        User user = userRepository.findById(certificate.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        return new CertificateVerifyDTO(
                certificate.getCertificateCode(),
                user.getName(),
                user.getEmail(),
                certificate.getCompletionPercentage(),
                certificate.getIssuedAt(),
                true
        );
    }

    public List<CertificateResponseDTO> getAllCertificates() {
        return certificateRepository.findAll().stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    private User getUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    private int calculateCompletionPercentage(long totalModules, long completedModules, long totalQuizzes, long passedQuizzes) {
        int modulePercent = totalModules == 0 ? 100 : (int) Math.round((completedModules * 100.0) / totalModules);
        int quizPercent = totalQuizzes == 0 ? 100 : (int) Math.round((passedQuizzes * 100.0) / totalQuizzes);

        if (totalModules == 0) {
            return Math.min(100, quizPercent);
        }
        if (totalQuizzes == 0) {
            return Math.min(100, modulePercent);
        }
        return Math.min(100, (modulePercent + quizPercent) / 2);
    }

    private String generateUniqueCertificateCode() {
        String code = "CR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        while (certificateRepository.findByCertificateCode(code).isPresent()) {
            code = "CR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }
        return code;
    }

    private byte[] createCertificatePdf(Certificate certificate, User user) {
        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage(PDRectangle.LETTER);
            document.addPage(page);

            try (PDPageContentStream content = new PDPageContentStream(document, page)) {
                float pageWidth = page.getMediaBox().getWidth();
                float pageHeight = page.getMediaBox().getHeight();

                content.setNonStrokingColor(new Color(10, 41, 71));
                content.addRect(0, pageHeight - 140, pageWidth, 140);
                content.fill();

                content.setNonStrokingColor(Color.WHITE);
                content.beginText();
                content.setFont(PDType1Font.HELVETICA_BOLD, 30);
                content.newLineAtOffset(60, pageHeight - 80);
                content.showText("CampusReady Certificate");
                content.endText();

                content.beginText();
                content.setFont(PDType1Font.HELVETICA, 12);
                content.newLineAtOffset(60, pageHeight - 100);
                content.showText("Awarded to:");
                content.endText();

                content.beginText();
                content.setFont(PDType1Font.HELVETICA_BOLD, 22);
                content.newLineAtOffset(60, pageHeight - 130);
                content.showText(user.getName());
                content.endText();

                content.beginText();
                content.setFont(PDType1Font.HELVETICA, 12);
                content.newLineAtOffset(60, pageHeight - 180);
                content.showText("For successfully completing the CampusReady preparedness training program.");
                content.endText();

                content.beginText();
                content.setFont(PDType1Font.HELVETICA, 12);
                content.newLineAtOffset(60, pageHeight - 210);
                content.showText("Issued on: " + certificate.getIssuedAt().toLocalDate().toString());
                content.endText();

                content.beginText();
                content.setFont(PDType1Font.HELVETICA, 12);
                content.newLineAtOffset(60, pageHeight - 230);
                content.showText("Completion: " + certificate.getCompletionPercentage() + "%");
                content.endText();

                content.beginText();
                content.setFont(PDType1Font.HELVETICA_BOLD, 12);
                content.newLineAtOffset(60, pageHeight - 260);
                content.showText("Certificate ID: " + certificate.getCertificateCode());
                content.endText();

                content.setNonStrokingColor(new Color(10, 41, 71));
                content.addRect(60, 90, 220, 3);
                content.fill();

                content.beginText();
                content.setNonStrokingColor(Color.DARK_GRAY);
                content.setFont(PDType1Font.HELVETICA_OBLIQUE, 11);
                content.newLineAtOffset(60, 70);
                content.showText("CampusReady — Disaster Preparedness Certified");
                content.endText();
            }

            try (ByteArrayOutputStream output = new ByteArrayOutputStream()) {
                document.save(output);
                return output.toByteArray();
            }
        } catch (IOException e) {
            throw new RuntimeException("Unable to create certificate PDF", e);
        }
    }

    private CertificateResponseDTO toResponseDto(Certificate certificate, User user) {
        return new CertificateResponseDTO(
                certificate.getId(),
                certificate.getUserId(),
                user.getName(),
                certificate.getCertificateCode(),
                certificate.getCompletionPercentage(),
                certificate.getIssuedAt()
        );
    }

    private CertificateResponseDTO toResponseDto(Certificate certificate) {
        User user = userRepository.findById(certificate.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return toResponseDto(certificate, user);
    }
}
