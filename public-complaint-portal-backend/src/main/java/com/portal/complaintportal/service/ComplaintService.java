package com.portal.complaintportal.service;

import com.portal.complaintportal.dto.*;
import com.portal.complaintportal.entity.*;
import com.portal.complaintportal.repository.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final ComplaintCategoryRepository categoryRepository;
    private final ComplaintStatusHistoryRepository historyRepository;

    public ComplaintService(
            ComplaintRepository complaintRepository,
            UserRepository userRepository,
            ComplaintCategoryRepository categoryRepository,
            ComplaintStatusHistoryRepository historyRepository) {

        this.complaintRepository = complaintRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.historyRepository = historyRepository;
    }

    // ==========================================
    // 1. SECURITY HELPER METHODS
    // ==========================================
    private User getAuthenticatedUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AccessDeniedException("Authenticated user account not found"));
    }

    private void checkComplaintAccess(Complaint complaint, User actor) {
        boolean isAdmin = actor.getRole() == Role.ADMIN;
        boolean isOwner = complaint.getUser().getId().equals(actor.getId());

        if (!isAdmin && !isOwner) {
            throw new AccessDeniedException("You are not allowed to access this complaint");
        }
    }

    // ==========================================
    // 2. CORE CRUD OPERATIONS (Secure)
    // ==========================================
    @Transactional
    public List<ComplaintResponse> getAllComplaints() {
        return complaintRepository.findAll().stream()
                .map(this::convertToResponse)
                .toList();
    }

    @Transactional
    public List<ComplaintResponse> getMyComplaints(String email) {
        User user = getAuthenticatedUser(email);
        return complaintRepository.findByUserId(user.getId()).stream()
                .map(this::convertToResponse)
                .toList();
    }

    @Transactional
    public ComplaintResponse createComplaint(ComplaintRequest request, String email) {
        User user = getAuthenticatedUser(email);

        if (user.getRole() != Role.CITIZEN) {
            throw new AccessDeniedException("Only citizens can create complaints");
        }

        ComplaintCategory category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Complaint category not found"));

        LocalDateTime now = LocalDateTime.now();

        Complaint complaint = new Complaint();
        complaint.setComplaintNumber(generateComplaintNumber());
        complaint.setTitle(request.getTitle());
        complaint.setDescription(request.getDescription());
        complaint.setLocation(request.getLocation());
        complaint.setUser(user);
        complaint.setCategory(category);
        complaint.setDepartment(category.getDepartment());
        complaint.setPriority(Priority.MEDIUM);
        complaint.setStatus(ComplaintStatus.SUBMITTED);
        complaint.setCreatedAt(now);
        complaint.setUpdatedAt(now);
        complaint.setAssignedOfficer(null);
        complaint.setResolvedAt(null);

        return convertToResponse(complaintRepository.save(complaint));
    }

    public ComplaintResponse updateComplaint(Long id, ComplaintRequest request, String email) {
        User actor = getAuthenticatedUser(email);

        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        checkComplaintAccess(complaint, actor);

        if (actor.getRole() == Role.CITIZEN && complaint.getStatus() != ComplaintStatus.SUBMITTED) {
            throw new AccessDeniedException("Only submitted complaints can be edited");
        }

        complaint.setTitle(request.getTitle());
        complaint.setDescription(request.getDescription());
        complaint.setLocation(request.getLocation());

        if (!complaint.getCategory().getId().equals(request.getCategoryId())) {
            ComplaintCategory category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Complaint category not found"));
            complaint.setCategory(category);
            complaint.setDepartment(category.getDepartment());
        }

        complaint.setUpdatedAt(LocalDateTime.now());

        return convertToResponse(complaintRepository.save(complaint));
    }

    public void deleteComplaint(Long id, String email) {
        User actor = getAuthenticatedUser(email);

        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        checkComplaintAccess(complaint, actor);

        if (actor.getRole() == Role.CITIZEN && complaint.getStatus() != ComplaintStatus.SUBMITTED) {
            throw new AccessDeniedException("Only submitted complaints can be deleted");
        }

        complaintRepository.delete(complaint);
    }

    // ==========================================
    // 3. SECURE READ & HISTORY
    // ==========================================
    @Transactional
    public ComplaintResponse getComplaintByIdSecure(Long id, String email) {
        User actor = getAuthenticatedUser(email);
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));
        
        if (actor.getRole() == Role.OFFICER) {
            if (complaint.getAssignedOfficer() == null || !complaint.getAssignedOfficer().getId().equals(actor.getId())) {
                throw new AccessDeniedException("You can only view complaints assigned to you");
            }
        } else {
            checkComplaintAccess(complaint, actor);
        }
        return convertToResponse(complaint);
    }

    @Transactional
    public List<ComplaintHistoryResponse> getComplaintHistorySecure(Long id, String email) {
        getComplaintByIdSecure(id, email); 
        return historyRepository.findByComplaintIdOrderByCreatedAtDesc(id).stream()
                .map(this::convertToHistoryResponse)
                .toList();
    }

    // ==========================================
    // 4. SECURE OFFICER OPERATIONS
    // ==========================================
    @Transactional
    public ComplaintResponse assignOfficer(Long complaintId, OfficerAssignmentRequest request, String adminEmail) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        User officer = userRepository.findById(request.getOfficerId())
                .orElseThrow(() -> new RuntimeException("Officer not found"));

        if (officer.getRole() != Role.OFFICER) {
            throw new RuntimeException("Selected user does not have OFFICER role");
        }

        User adminUser = getAuthenticatedUser(adminEmail);
        if (adminUser.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Only an admin can assign officers");
        }

        ComplaintStatus oldStatus = complaint.getStatus();
        complaint.setAssignedOfficer(officer);
        complaint.setStatus(ComplaintStatus.ASSIGNED);
        complaint.setUpdatedAt(LocalDateTime.now());

        Complaint savedComplaint = complaintRepository.save(complaint);

        ComplaintStatusHistory history = new ComplaintStatusHistory();
        history.setComplaint(savedComplaint);
        history.setOldStatus(oldStatus);
        history.setNewStatus(ComplaintStatus.ASSIGNED);
        history.setChangedBy(adminUser);
        history.setRemarks(request.getRemarks());
        historyRepository.save(history);

        return convertToResponse(savedComplaint);
    }
    @Transactional
    public List<ComplaintResponse> getAssignedComplaints(String officerEmail) {
        User officer = getAuthenticatedUser(officerEmail);
        if (officer.getRole() != Role.OFFICER) {
            throw new AccessDeniedException("Only officers can view assigned complaints");
        }
        return complaintRepository.findByAssignedOfficerId(officer.getId()).stream()
                .map(this::convertToResponse)
                .toList();
    }

    @Transactional
    public ComplaintResponse updateOfficerComplaintStatus(Long complaintId, OfficerStatusUpdateRequest request, String officerEmail) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        User officer = getAuthenticatedUser(officerEmail);

        if (complaint.getAssignedOfficer() == null || !complaint.getAssignedOfficer().getId().equals(officer.getId())) {
            throw new AccessDeniedException("You can only update complaints assigned to you");
        }

        ComplaintStatus newStatus;
        try {
            newStatus = ComplaintStatus.valueOf(request.getNewStatus().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status provided");
        }

        ComplaintStatus oldStatus = complaint.getStatus();
        complaint.setStatus(newStatus);
        
        if (newStatus == ComplaintStatus.RESOLVED || newStatus == ComplaintStatus.CLOSED) {
            complaint.setResolvedAt(LocalDateTime.now());
        }
        complaint.setUpdatedAt(LocalDateTime.now());

        Complaint savedComplaint = complaintRepository.save(complaint);

        ComplaintStatusHistory history = new ComplaintStatusHistory();
        history.setComplaint(savedComplaint);
        history.setOldStatus(oldStatus);
        history.setNewStatus(newStatus);
        history.setChangedBy(officer);
        history.setRemarks(request.getRemarks());
        historyRepository.save(history);

        return convertToResponse(savedComplaint);
    }

// 5. UTILITY & MAPPING METHODS

    public ComplaintResponse convertToResponse(Complaint complaint) {
        ComplaintResponse response = new ComplaintResponse();
        response.setId(complaint.getId());
        response.setComplaintNumber(complaint.getComplaintNumber());
        response.setTitle(complaint.getTitle());
        response.setDescription(complaint.getDescription());
        response.setLocation(complaint.getLocation());
        response.setStatus(complaint.getStatus().name());
        response.setPriority(complaint.getPriority().name());
        response.setCreatedAt(complaint.getCreatedAt());
        response.setUpdatedAt(complaint.getUpdatedAt());
        response.setResolvedAt(complaint.getResolvedAt());
        
        if (complaint.getUser() != null) {
            response.setUserId(complaint.getUser().getId());
            response.setUserName(complaint.getUser().getName());
        }
        if (complaint.getCategory() != null) {
            response.setCategoryId(complaint.getCategory().getId());
            response.setCategoryName(complaint.getCategory().getName());
        }
        if (complaint.getDepartment() != null) {
            response.setDepartmentId(complaint.getDepartment().getId());
            response.setDepartmentName(complaint.getDepartment().getName());
        }
        if (complaint.getAssignedOfficer() != null) {
            response.setAssignedOfficerId(complaint.getAssignedOfficer().getId());
            response.setAssignedOfficerName(complaint.getAssignedOfficer().getName());
        }
        return response;
    }

    private ComplaintHistoryResponse convertToHistoryResponse(ComplaintStatusHistory history) {
        ComplaintHistoryResponse response = new ComplaintHistoryResponse();
        response.setId(history.getId());
        response.setComplaintId(history.getComplaint().getId());
        response.setOldStatus(history.getOldStatus() != null ? history.getOldStatus().name() : null);
        response.setNewStatus(history.getNewStatus().name());
        response.setChangedById(history.getChangedBy().getId());
        response.setChangedByName(history.getChangedBy().getName());
        response.setRemarks(history.getRemarks());
        response.setCreatedAt(history.getCreatedAt());
        return response;
    }

    private String generateComplaintNumber() {
        return "CMP-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
    }
}