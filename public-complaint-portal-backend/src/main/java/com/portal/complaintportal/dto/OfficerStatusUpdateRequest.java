package com.portal.complaintportal.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class OfficerStatusUpdateRequest {

    @NotNull(message = "New status is required")
    private String newStatus;

    @NotBlank(message = "Remarks are required")
    private String remarks;

    // Getters and Setters
    public String getNewStatus() { return newStatus; }
    public void setNewStatus(String newStatus) { this.newStatus = newStatus; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}