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

    // private byte[] createCertificatePdf(Certificate certificate, User user) {
    //     try (PDDocument document = new PDDocument()) {
    //         PDPage page = new PDPage(PDRectangle.LETTER);
    //         document.addPage(page);

    //         try (PDPageContentStream content = new PDPageContentStream(document, page)) {
    //             float pageWidth = page.getMediaBox().getWidth();
    //             float pageHeight = page.getMediaBox().getHeight();

    //             content.setNonStrokingColor(new Color(10, 41, 71));
    //             content.addRect(0, pageHeight - 140, pageWidth, 140);
    //             content.fill();

    //             content.setNonStrokingColor(Color.WHITE);
    //             content.beginText();
    //             content.setFont(PDType1Font.HELVETICA_BOLD, 30);
    //             content.newLineAtOffset(60, pageHeight - 80);
    //             content.showText("CampusReady Certificate");
    //             content.endText();

    //             content.beginText();
    //             content.setFont(PDType1Font.HELVETICA, 12);
    //             content.newLineAtOffset(60, pageHeight - 100);
    //             content.showText("Awarded to:");
    //             content.endText();

    //             content.beginText();
    //             content.setFont(PDType1Font.HELVETICA_BOLD, 22);
    //             content.newLineAtOffset(60, pageHeight - 130);
    //             content.showText(user.getName());
    //             content.endText();

    //             content.beginText();
    //             content.setFont(PDType1Font.HELVETICA, 12);
    //             content.newLineAtOffset(60, pageHeight - 180);
    //             content.showText("For successfully completing the CampusReady preparedness training program.");
    //             content.endText();

    //             content.beginText();
    //             content.setFont(PDType1Font.HELVETICA, 12);
    //             content.newLineAtOffset(60, pageHeight - 210);
    //             content.showText("Issued on: " + certificate.getIssuedAt().toLocalDate().toString());
    //             content.endText();

    //             content.beginText();
    //             content.setFont(PDType1Font.HELVETICA, 12);
    //             content.newLineAtOffset(60, pageHeight - 230);
    //             content.showText("Completion: " + certificate.getCompletionPercentage() + "%");
    //             content.endText();

    //             content.beginText();
    //             content.setFont(PDType1Font.HELVETICA_BOLD, 12);
    //             content.newLineAtOffset(60, pageHeight - 260);
    //             content.showText("Certificate ID: " + certificate.getCertificateCode());
    //             content.endText();

    //             content.setNonStrokingColor(new Color(10, 41, 71));
    //             content.addRect(60, 90, 220, 3);
    //             content.fill();

    //             content.beginText();
    //             content.setNonStrokingColor(Color.DARK_GRAY);
    //             content.setFont(PDType1Font.HELVETICA_OBLIQUE, 11);
    //             content.newLineAtOffset(60, 70);
    //             content.showText("CampusReady — Disaster Preparedness Certified");
    //             content.endText();
    //         }

    //         try (ByteArrayOutputStream output = new ByteArrayOutputStream()) {
    //             document.save(output);
    //             return output.toByteArray();
    //         }
    //     } catch (IOException e) {
    //         throw new RuntimeException("Unable to create certificate PDF", e);
    //     }
    // }

    private byte[] createCertificatePdf(Certificate certificate, User user) {
    try (PDDocument document = new PDDocument()) {

        PDPage page = new PDPage(PDRectangle.LETTER.rotate());
        document.addPage(page);

        try (PDPageContentStream content = new PDPageContentStream(document, page)) {

            float pageWidth = page.getMediaBox().getWidth();
            float pageHeight = page.getMediaBox().getHeight();

            // Background
            content.setNonStrokingColor(new Color(248, 250, 252));
            content.addRect(0, 0, pageWidth, pageHeight);
            content.fill();

            // Outer border
            content.setStrokingColor(new Color(11, 58, 91));
            content.setLineWidth(4);
            content.addRect(30, 30, pageWidth - 60, pageHeight - 60);
            content.stroke();

            // Inner border
            content.setLineWidth(1.5f);
            content.addRect(45, 45, pageWidth - 90, pageHeight - 90);
            content.stroke();

            // Top banner
            content.setNonStrokingColor(new Color(11, 39, 66));
            content.addRect(0, pageHeight - 140, pageWidth, 140);
            content.fill();

            // Main title
            content.beginText();
            content.setNonStrokingColor(Color.WHITE);
            content.setFont(PDType1Font.HELVETICA_BOLD, 34);
            content.newLineAtOffset(250, pageHeight - 85);
            content.showText("CERTIFICATE OF COMPLETION");
            content.endText();

            // Subtitle
            content.beginText();
            content.setFont(PDType1Font.HELVETICA, 16);
            content.newLineAtOffset(355, pageHeight - 115);
            content.showText("CampusReady");
            content.endText();

            // Awarded text
            content.beginText();
            content.setNonStrokingColor(new Color(75, 100, 119));
            content.setFont(PDType1Font.HELVETICA, 18);
            content.newLineAtOffset(350, 420);
            content.showText("This certificate is awarded to");
            content.endText();

            // User name
            content.beginText();
            content.setNonStrokingColor(new Color(11, 58, 91));
            content.setFont(PDType1Font.HELVETICA_BOLD, 38);
            content.newLineAtOffset(300, 360);
            content.showText(user.getName());
            content.endText();

            // Decorative line
            content.setStrokingColor(new Color(11, 58, 91));
            content.setLineWidth(2);
            content.moveTo(250, 345);
            content.lineTo(550, 345);
            content.stroke();

            // Description
            content.beginText();
            content.setNonStrokingColor(new Color(40, 55, 71));
            content.setFont(PDType1Font.HELVETICA, 16);
            content.newLineAtOffset(220, 290);
            content.showText("For successfully completing the CampusReady");
            content.endText();

            content.beginText();
            content.newLineAtOffset(255, 265);
            content.showText("Disaster Preparedness Training Program.");
            content.endText();

            // Completion percentage
            content.beginText();
            content.setFont(PDType1Font.HELVETICA_BOLD, 18);
            content.setNonStrokingColor(new Color(11, 58, 91));
            content.newLineAtOffset(345, 215);
            content.showText("Completion: " + certificate.getCompletionPercentage() + "%");
            content.endText();

            // Date section
            content.beginText();
            content.setFont(PDType1Font.HELVETICA, 14);
            content.setNonStrokingColor(Color.DARK_GRAY);
            content.newLineAtOffset(90, 90);
            content.showText("Issued on: " + certificate.getIssuedAt().toLocalDate());
            content.endText();

            // Certificate ID
            content.beginText();
            content.setFont(PDType1Font.HELVETICA_BOLD, 14);
            content.newLineAtOffset(90, 65);
            content.showText("Certificate ID: " + certificate.getCertificateCode());
            content.endText();

            // Signature line
            content.setLineWidth(1.5f);
            content.moveTo(560, 100);
            content.lineTo(720, 100);
            content.stroke();

            content.beginText();
            content.setFont(PDType1Font.HELVETICA_OBLIQUE, 12);
            content.newLineAtOffset(485, 80);
            content.showText("Authorized Signature");
            content.endText();

            // Footer
            content.beginText();
            content.setNonStrokingColor(new Color(90, 105, 120));
            content.setFont(PDType1Font.HELVETICA_OBLIQUE, 11);
            content.newLineAtOffset(260, 40);
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
