package com.portal.complaintportal.dto;

import jakarta.validation.constraints.NotNull;

public class OfficerAssignmentRequest {

    @NotNull(message = "Officer ID is required")
    private Long officerId; // Keep this! The admin still needs to tell us WHICH officer they are assigning.

    private String remarks;

    // Getters and Setters
    public Long getOfficerId() { return officerId; }
    public void setOfficerId(Long officerId) { this.officerId = officerId; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}