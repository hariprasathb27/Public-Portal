package com.portal.complaintportal.config;

import com.portal.complaintportal.entity.Role;
import com.portal.complaintportal.entity.User;
import com.portal.complaintportal.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // Admin account create panrom (already illana mattum)
        if (userRepository.findByEmail("admin@portal.com").isEmpty()) {
            User admin = new User();
            admin.setName("System Admin");
            admin.setEmail("admin@portal.com");
            admin.setPassword(passwordEncoder.encode("admin123")); // Password encrypted!
            admin.setPhone("9999999999");
            admin.setRole(Role.ADMIN);
            admin.setCreatedAt(LocalDateTime.now());
            userRepository.save(admin);
            System.out.println("Default Admin account created!");
        }

        // Officer account create panrom (already illana mattum)
        if (userRepository.findByEmail("officer@portal.com").isEmpty()) {
            User officer = new User();
            officer.setName("Field Officer 1");
            officer.setEmail("officer@portal.com");
            officer.setPassword(passwordEncoder.encode("officer123")); // Password encrypted!
            officer.setPhone("8888888888");
            officer.setRole(Role.OFFICER);
            officer.setCreatedAt(LocalDateTime.now());
            userRepository.save(officer);
            System.out.println("Default Officer account created!");
        }
        if (userRepository.findByEmail("officer2@portal.com").isEmpty()) {
            User officer2 = new User();
            officer2.setName("Field Officer 2");
            officer2.setEmail("officer2@portal.com");
            officer2.setPassword(passwordEncoder.encode("officer123")); 
            officer2.setPhone("7777777777");
            officer2.setRole(Role.OFFICER);
            officer2.setCreatedAt(LocalDateTime.now());
            userRepository.save(officer2);
            System.out.println("Default Officer 2 account created!");
        }
    }
}