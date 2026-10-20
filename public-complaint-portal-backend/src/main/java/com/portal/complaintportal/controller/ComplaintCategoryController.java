package com.portal.complaintportal.controller;

import com.portal.complaintportal.entity.ComplaintCategory;
import com.portal.complaintportal.service.ComplaintCategoryService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class ComplaintCategoryController {

    private final ComplaintCategoryService categoryService;

    public ComplaintCategoryController(
            ComplaintCategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @PostMapping
    public ComplaintCategory createCategory(
            @RequestBody ComplaintCategory category) {

        return categoryService.createCategory(category);
    }

    @GetMapping
    public List<ComplaintCategory> getAllCategories() {
        return categoryService.getAllCategories();
    }
}