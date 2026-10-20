
package com.portal.complaintportal.dto;

public record AuthResponse(
        String token,
        String tokenType,
        String role
) {}
