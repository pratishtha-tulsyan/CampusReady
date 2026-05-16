package com.campusready.campusready.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.campusready.campusready.entity.Certificate;

@Repository
public interface CertificateRepository extends JpaRepository<Certificate, Long> {

    Optional<Certificate> findByUserId(Long userId);

    Optional<Certificate> findByCertificateCode(String certificateCode);
}
