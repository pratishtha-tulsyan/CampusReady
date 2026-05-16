package com.campusready.campusready.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.campusready.campusready.dto.CreateQuestionRequest;
import com.campusready.campusready.dto.CreateQuizRequest;
import com.campusready.campusready.dto.QuestionDTO;
import com.campusready.campusready.dto.QuizResultDTO;
import com.campusready.campusready.dto.QuizSubmissionRequest;
import com.campusready.campusready.entity.Question;
import com.campusready.campusready.entity.Quiz;
import com.campusready.campusready.entity.QuizAttempt;
import com.campusready.campusready.entity.User;
import com.campusready.campusready.repository.UserRepository;
import com.campusready.campusready.service.QuizService;

@RestController
@RequestMapping("/quiz")
public class QuizController {

    private final QuizService quizService;
    private final UserRepository userRepository;

    public QuizController(QuizService quizService, UserRepository userRepository) {
        this.quizService = quizService;
        this.userRepository = userRepository;
    }

    /**
     * Get quiz for a specific module
     */
    @GetMapping("/module/{moduleId}")
    public ResponseEntity<?> getQuizByModule(@PathVariable Long moduleId) {
        try {
            Quiz quiz = quizService.getQuizByModuleId(moduleId);
            Map<String, Object> response = new HashMap<>();
            response.put("id", quiz.getId());
            response.put("moduleId", quiz.getModuleId());
            response.put("title", quiz.getTitle());
            response.put("description", quiz.getDescription());
            response.put("passingScore", quiz.getPassingScore());
            response.put("totalQuestions", quiz.getTotalQuestions());
            response.put("active", quiz.getActive());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Quiz not found"));
        }
    }

    /**
     * Get questions for a quiz (without correct answers)
     */
    @GetMapping("/{quizId}/questions")
    public ResponseEntity<List<QuestionDTO>> getQuizQuestions(@PathVariable Long quizId) {
        List<QuestionDTO> questions = quizService.getQuizQuestions(quizId);
        return ResponseEntity.ok(questions);
    }

    /**
     * Submit quiz answers and get result
     */
    @PostMapping("/submit")
    public ResponseEntity<?> submitQuiz(
            @RequestBody QuizSubmissionRequest request,
            Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "User not authenticated"));
        }

        try {
            QuizResultDTO result = quizService.submitQuiz(request, authentication);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get user's quiz history
     */
    @GetMapping("/{quizId}/history")
    public ResponseEntity<?> getQuizHistory(
            @PathVariable Long quizId,
            Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "User not authenticated"));
        }

        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<QuizAttempt> history = quizService.getQuizHistory(user.getId(), quizId);
        return ResponseEntity.ok(history);
    }

    /**
     * Check if user has passed a quiz
     */
    @GetMapping("/{quizId}/passed")
    public ResponseEntity<?> hasUserPassedQuiz(
            @PathVariable Long quizId,
            Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "User not authenticated"));
        }

        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean passed = quizService.hasUserPassedQuiz(user.getId(), quizId);
        return ResponseEntity.ok(Map.of("passed", passed));
    }

    // ===== ADMIN ENDPOINTS =====

    /**
     * Create a new quiz (Admin only)
     */
    @PostMapping("/create")
    public ResponseEntity<?> createQuiz(
            @RequestBody CreateQuizRequest request,
            Authentication authentication
    ) {
        if (!isAdmin(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only admins can create quizzes"));
        }

        try {
            Quiz quiz = Quiz.builder()
                    .moduleId(request.getModuleId())
                    .title(request.getTitle())
                    .description(request.getDescription())
                    .passingScore(request.getPassingScore() != null ? request.getPassingScore() : 70)
                    .totalQuestions(0)
                    .active(true)
                    .build();

            Quiz savedQuiz = quizService.createQuiz(quiz);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedQuiz);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Add a question to a quiz (Admin only)
     */
    @PostMapping("/{quizId}/questions")
    public ResponseEntity<?> addQuestion(
            @PathVariable Long quizId,
            @RequestBody CreateQuestionRequest request,
            Authentication authentication
    ) {
        if (!isAdmin(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only admins can add questions"));
        }

        try {
            Question question = Question.builder()
                    .quizId(quizId)
                    .questionText(request.getQuestionText())
                    .optionA(request.getOptionA())
                    .optionB(request.getOptionB())
                    .optionC(request.getOptionC())
                    .optionD(request.getOptionD())
                    .correctAnswer(request.getCorrectAnswer())
                    .questionNumber(request.getQuestionNumber())
                    .build();

            Question savedQuestion = quizService.addQuestion(quizId, question);

            // Update total questions in quiz metadata
            Quiz quiz = quizService.getQuizById(quizId);
            List<QuestionDTO> allQuestions = quizService.getQuizQuestions(quizId);
            quiz.setTotalQuestions(allQuestions.size());
            quizService.updateQuiz(quizId, quiz);

            return ResponseEntity.status(HttpStatus.CREATED).body(savedQuestion);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Update a quiz (Admin only)
     */
    @PutMapping("/{quizId}")
    public ResponseEntity<?> updateQuiz(
            @PathVariable Long quizId,
            @RequestBody Quiz quizUpdate,
            Authentication authentication
    ) {
        if (!isAdmin(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only admins can update quizzes"));
        }

        try {
            Quiz updated = quizService.updateQuiz(quizId, quizUpdate);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Delete a question (Admin only)
     */
    @DeleteMapping("/questions/{questionId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<?> deleteQuestion(
            @PathVariable Long questionId,
            Authentication authentication
    ) {
        if (!isAdmin(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only admins can delete questions"));
        }

        try {
            quizService.deleteQuestion(questionId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Delete a quiz (Admin only)
     */
    @DeleteMapping("/{quizId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<?> deleteQuiz(
            @PathVariable Long quizId,
            Authentication authentication
    ) {
        if (!isAdmin(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only admins can delete quizzes"));
        }

        try {
            quizService.deleteQuiz(quizId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    private boolean isAdmin(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return "ADMIN".equalsIgnoreCase(user.getRole());
    }
}
