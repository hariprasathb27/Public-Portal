package com.portal.complaintportal.controller;

import com.portal.complaintportal.dto.ComplaintResponse;
import com.portal.complaintportal.dto.OfficerStatusUpdateRequest;
import com.portal.complaintportal.service.ComplaintService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/officers")
public class OfficerController {

    private final ComplaintService complaintService;

    public OfficerController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    @GetMapping("/my-complaints")
    public ResponseEntity<List<ComplaintResponse>> getAssignedComplaints(Authentication authentication) {
        // Pass the JWT email instead of a path variable
        List<ComplaintResponse> complaints = complaintService.getAssignedComplaints(authentication.getName());
        return ResponseEntity.ok(complaints);
    }
    
    @PatchMapping("/complaints/{complaintId}/status")
    public ResponseEntity<ComplaintResponse> updateComplaintStatus(
            @PathVariable Long complaintId,
            @Valid @RequestBody OfficerStatusUpdateRequest request,
            Authentication authentication) {

        ComplaintResponse response = complaintService.updateOfficerComplaintStatus(
                complaintId, request, authentication.getName());
        return ResponseEntity.ok(response);
    }
}
