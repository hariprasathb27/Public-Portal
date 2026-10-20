
package com.portal.complaintportal.repository;

import com.portal.complaintportal.entity.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    boolean existsByComplaintNumber(String complaintNumber);
    @Query("SELECT c FROM Complaint c WHERE c.officer.id = :officerId")
    List<Complaint> findByAssignedOfficerId(Long officerId);
    List<Complaint> findByUserId(Long userId);
}
