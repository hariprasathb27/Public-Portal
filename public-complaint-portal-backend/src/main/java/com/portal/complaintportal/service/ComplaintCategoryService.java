package com.portal.complaintportal.service;


import com.portal.complaintportal.entity.ComplaintCategory;
import com.portal.complaintportal.repository.ComplaintCategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ComplaintCategoryService {

    private final ComplaintCategoryRepository categoryRepository;

    public ComplaintCategoryService(
            ComplaintCategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public ComplaintCategory createCategory(ComplaintCategory category) {
        return categoryRepository.save(category);
    }

    public List<ComplaintCategory> getAllCategories() {
        return categoryRepository.findAll();
    }
}
