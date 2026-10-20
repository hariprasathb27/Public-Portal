package com.portal.complaintportal.repository;

import com.portal.complaintportal.entity.ComplaintStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ComplaintStatusHistoryRepository extends JpaRepository<ComplaintStatusHistory, Long> {
    // This custom method fetches the history for a specific complaint, newest first
    List<ComplaintStatusHistory> findByComplaintIdOrderByCreatedAtDesc(Long complaintId);
}
