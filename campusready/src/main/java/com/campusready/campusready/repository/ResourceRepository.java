package com.campusready.campusready.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.campusready.campusready.entity.Resource;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {
    List<Resource> findByCategoryIgnoreCase(String category);
}
