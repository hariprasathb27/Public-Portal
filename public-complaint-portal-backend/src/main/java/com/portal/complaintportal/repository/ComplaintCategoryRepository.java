package com.portal.complaintportal.repository;

import com.portal.complaintportal.entity.ComplaintCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ComplaintCategoryRepository
        extends JpaRepository<ComplaintCategory, Long> {
}