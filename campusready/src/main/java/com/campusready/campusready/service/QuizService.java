package com.campusready.campusready.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.campusready.campusready.dto.QuizResultDTO;
import com.campusready.campusready.dto.QuestionDTO;
import com.campusready.campusready.dto.QuizSubmissionRequest;
import com.campusready.campusready.entity.Progress;
import com.campusready.campusready.entity.Question;
import com.campusready.campusready.entity.Quiz;
import com.campusready.campusready.entity.QuizAttempt;
import com.campusready.campusready.entity.User;
import com.campusready.campusready.repository.ProgressRepository;
import com.campusready.campusready.repository.QuestionRepository;
import com.campusready.campusready.repository.QuizAttemptRepository;
import com.campusready.campusready.repository.QuizRepository;
import com.campusready.campusready.repository.UserRepository;

@Service
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final UserRepository userRepository;
    private final ProgressRepository progressRepository;
    private final ObjectMapper objectMapper;

    public QuizService(
            QuizRepository quizRepository,
            QuestionRepository questionRepository,
            QuizAttemptRepository quizAttemptRepository,
            UserRepository userRepository,
            ProgressRepository progressRepository
    ) {
        this.quizRepository = quizRepository;
        this.questionRepository = questionRepository;
        this.quizAttemptRepository = quizAttemptRepository;
        this.userRepository = userRepository;
        this.progressRepository = progressRepository;
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Create a new quiz for a module (Admin only)
     */
    public Quiz createQuiz(Quiz quiz) {
        return quizRepository.save(quiz);
    }

    /**
     * Add a question to a quiz (Admin only)
     */
    public Question addQuestion(Long quizId, Question question) {
        question.setQuizId(quizId);
        return questionRepository.save(question);
    }

    /**
     * Get quiz by module ID
     */
    public Quiz getQuizByModuleId(Long moduleId) {
        return quizRepository.findByModuleId(moduleId)
                .orElseThrow(() -> new RuntimeException("Quiz not found for module: " + moduleId));
    }

    public Quiz getQuizById(Long quizId) {
        return quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found: " + quizId));
    }

    /**
     * Get all questions for a quiz (without answers)
     */
    public List<QuestionDTO> getQuizQuestions(Long quizId) {
        List<Question> questions = questionRepository.findByQuizIdOrderByQuestionNumber(quizId);
        return questions.stream()
                .map(q -> QuestionDTO.builder()
                        .id(q.getId())
                        .quizId(q.getQuizId())
                        .questionText(q.getQuestionText())
                        .optionA(q.getOptionA())
                        .optionB(q.getOptionB())
                        .optionC(q.getOptionC())
                        .optionD(q.getOptionD())
                        .questionNumber(q.getQuestionNumber())
                        .build())
                .toList();
    }

    /**
     * Submit quiz answers and calculate score
     */
    public QuizResultDTO submitQuiz(
            QuizSubmissionRequest request,
            Authentication authentication
    ) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Quiz quiz = quizRepository.findById(request.getQuizId())
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        List<Question> questions = questionRepository.findByQuizIdOrderByQuestionNumber(quiz.getId());

        int correctCount = 0;
        Map<Long, String> userAnswers = request.getAnswers();

        // Calculate score
        for (Question question : questions) {
            String userAnswer = userAnswers.get(question.getId());
            if (userAnswer != null && userAnswer.equals(question.getCorrectAnswer())) {
                correctCount++;
            }
        }

        int totalQuestions = questions.size();
        int score = (totalQuestions > 0) ? (correctCount * 100) / totalQuestions : 0;
        boolean passed = score >= quiz.getPassingScore();

        // Save quiz attempt
        String answersJson = convertAnswersToJson(userAnswers);
        QuizAttempt attempt = QuizAttempt.builder()
                .userId(user.getId())
                .quizId(quiz.getId())
                .score(score)
                .correctAnswers(correctCount)
                .totalQuestions(totalQuestions)
                .passed(passed)
                .attemptedAt(LocalDateTime.now())
                .answers(answersJson)
                .build();

        QuizAttempt savedAttempt = quizAttemptRepository.save(attempt);

        // Update progress if quiz is passed
        if (passed) {
            Progress progress = progressRepository
                    .findByUserIdAndModuleId(user.getId(), quiz.getModuleId())
                    .orElseGet(() -> Progress.builder()
                            .userId(user.getId())
                            .moduleId(quiz.getModuleId())
                            .completed(false)
                            .build());

            progress.setCompleted(true);
            progress.setCompletedAt(LocalDateTime.now());
            progressRepository.save(progress);
        }

        String message = passed ? "Quiz Passed! ✅" : "Quiz Failed. Try again.";

        return QuizResultDTO.builder()
                .attemptId(savedAttempt.getId())
                .score(score)
                .correctAnswers(correctCount)
                .totalQuestions(totalQuestions)
                .passed(passed)
                .message(message)
                .build();
    }

    /**
     * Get quiz history for a user (all attempts)
     */
    public List<QuizAttempt> getQuizHistory(Long userId, Long quizId) {
        return quizAttemptRepository.findByUserIdAndQuizIdOrderByAttemptedAtDesc(userId, quizId);
    }

    /**
     * Check if user has passed a quiz
     */
    public boolean hasUserPassedQuiz(Long userId, Long quizId) {
        return quizAttemptRepository.findFirstByUserIdAndQuizIdAndPassedTrue(userId, quizId)
                .isPresent();
    }

    /**
     * Get latest quiz attempt for a user
     */
    public Optional<QuizAttempt> getLatestAttempt(Long userId, Long quizId) {
        List<QuizAttempt> attempts = quizAttemptRepository
                .findByUserIdAndQuizIdOrderByAttemptedAtDesc(userId, quizId);
        return attempts.isEmpty() ? Optional.empty() : Optional.of(attempts.get(0));
    }

    /**
     * Update quiz (Admin only)
     */
    public Quiz updateQuiz(Long quizId, Quiz quizUpdate) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        if (quizUpdate.getTitle() != null) {
            quiz.setTitle(quizUpdate.getTitle());
        }
        if (quizUpdate.getDescription() != null) {
            quiz.setDescription(quizUpdate.getDescription());
        }
        if (quizUpdate.getPassingScore() != null) {
            quiz.setPassingScore(quizUpdate.getPassingScore());
        }
        if (quizUpdate.getActive() != null) {
            quiz.setActive(quizUpdate.getActive());
        }

        return quizRepository.save(quiz);
    }

    /**
     * Delete a question
     */
    public void deleteQuestion(Long questionId) {
        questionRepository.deleteById(questionId);
    }

    /**
     * Delete a quiz and its questions
     */
    public void deleteQuiz(Long quizId) {
        List<Question> questions = questionRepository.findByQuizIdOrderByQuestionNumber(quizId);
        questionRepository.deleteAll(questions);
        quizRepository.deleteById(quizId);
    }

    private String convertAnswersToJson(Map<Long, String> answers) {
        try {
            return objectMapper.writeValueAsString(answers);
        } catch (Exception e) {
            return "{}";
        }
    }
}
