package com.campusready.campusready.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.campusready.campusready.entity.QuizAttempt;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {
    List<QuizAttempt> findByUserId(Long userId);
    List<QuizAttempt> findByUserIdAndQuizIdOrderByAttemptedAtDesc(Long userId, Long quizId);
    List<QuizAttempt> findByUserIdAndPassedTrue(Long userId);

    Optional<QuizAttempt> findFirstByUserIdAndQuizIdAndPassedTrue(Long userId, Long quizId);
}
