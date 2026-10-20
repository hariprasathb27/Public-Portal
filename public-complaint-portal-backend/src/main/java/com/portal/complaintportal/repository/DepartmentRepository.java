package com.portal.complaintportal.repository;

import com.portal.complaintportal.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DepartmentRepository extends JpaRepository<Department, Long> {
}
