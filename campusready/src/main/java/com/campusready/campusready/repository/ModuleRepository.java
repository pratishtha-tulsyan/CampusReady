package com.campusready.campusready.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.campusready.campusready.entity.Module;

@Repository
public interface ModuleRepository extends JpaRepository<Module, Long> {
}
