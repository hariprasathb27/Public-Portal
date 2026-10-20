package com.portal.complaintportal.controller;

import com.portal.complaintportal.dto.ComplaintHistoryResponse;
import com.portal.complaintportal.dto.ComplaintRequest;
import com.portal.complaintportal.dto.ComplaintResponse;
import com.portal.complaintportal.dto.OfficerAssignmentRequest;
import com.portal.complaintportal.service.ComplaintService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

    private final ComplaintService complaintService;

    public ComplaintController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    // --- 1. Secure Create ---
    @PostMapping
    public ResponseEntity<ComplaintResponse> createComplaint(
            @Valid @RequestBody ComplaintRequest request,
            Authentication authentication) {

        ComplaintResponse response =
                complaintService.createComplaint(request, authentication.getName());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // --- 2. Secure Update ---
    @PutMapping("/{id}")
    public ResponseEntity<ComplaintResponse> updateComplaint(
            @PathVariable Long id,
            @Valid @RequestBody ComplaintRequest request,
            Authentication authentication) {

        ComplaintResponse response =
                complaintService.updateComplaint(id, request, authentication.getName());

        return ResponseEntity.ok(response);
    }

    // --- 3. Secure Delete ---
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComplaint(
            @PathVariable Long id,
            Authentication authentication) {

        complaintService.deleteComplaint(id, authentication.getName());

        return ResponseEntity.noContent().build();
    }

    // --- 4. Get All (Admin only via SecurityConfig) ---
    @GetMapping
    public ResponseEntity<List<ComplaintResponse>> getAllComplaints() {
        return ResponseEntity.ok(complaintService.getAllComplaints());
    }

    // --- 5. Get By ID (Secure Read) ---
    @GetMapping("/{id}")
    public ResponseEntity<ComplaintResponse> getComplaintById(
            @PathVariable Long id, 
            Authentication authentication) {
        ComplaintResponse response = complaintService.getComplaintByIdSecure(id, authentication.getName());
        return ResponseEntity.ok(response);
    }

    // --- 6. History (Secure) ---
    @GetMapping("/{id}/history")
    public ResponseEntity<List<ComplaintHistoryResponse>> getComplaintHistory(
            @PathVariable Long id, 
            Authentication authentication) {
        List<ComplaintHistoryResponse> history = complaintService.getComplaintHistorySecure(id, authentication.getName());
        return ResponseEntity.ok(history);
    }

    // --- 7. Assign Officer (Secure) ---
    @PatchMapping("/{id}/assign")
    public ResponseEntity<ComplaintResponse> assignOfficer(
            @PathVariable Long id,
            @Valid @RequestBody OfficerAssignmentRequest request,
            Authentication authentication) {

        ComplaintResponse response = complaintService.assignOfficer(id, request, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my")
    public ResponseEntity<List<ComplaintResponse>> getMyComplaints(Authentication authentication) {
        return ResponseEntity.ok(complaintService.getMyComplaints(authentication.getName()));
    }
}