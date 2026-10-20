package com.portal.complaintportal.controller;

import com.portal.complaintportal.entity.Role;
import com.portal.complaintportal.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;

    public AdminController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/officers")
    public ResponseEntity<List<Map<String, Object>>> getAllOfficers() {
        List<Map<String, Object>> officers = userRepository.findByRole(Role.OFFICER).stream()
                .map(user -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", user.getId());
                    map.put("name", user.getName());
                    return map;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(officers);
    }
}