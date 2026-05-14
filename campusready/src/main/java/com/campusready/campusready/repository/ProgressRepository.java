package com.campusready.campusready.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.campusready.campusready.entity.Progress;

@Repository
public interface ProgressRepository extends JpaRepository<Progress, Long> {

    List<Progress> findByUserId(Long userId);

    Optional<Progress> findByUserIdAndModuleId(Long userId, Long moduleId);

}
