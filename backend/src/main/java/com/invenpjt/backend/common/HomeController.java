package com.invenpjt.backend.common;

import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    @GetMapping("/")
    public Map<String, String> home() {
        return Map.of(
                "message", "InvenPJT backend is running.",
                "frontend", "http://localhost:5173",
                "api", "http://localhost:8080/api/boards"
        );
    }
}

