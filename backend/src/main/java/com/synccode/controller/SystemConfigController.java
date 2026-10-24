package com.synccode.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller exposing system feature availability and configuration.
 * Code execution is controlled here: if no isolated sandbox is configured,
 * it safely communicates that code execution is not enabled.
 */
@RestController
@RequestMapping("/api/v1/system")
public class SystemConfigController {

    @Value("${synccode.execution.service-url:}")
    private String executionServiceUrl;

    @Value("${synccode.livekit.url:}")
    private String livekitUrl;

    @Value("${synccode.collaboration.port:1234}")
    private int collaborationPort;

    @GetMapping("/config")
    public ResponseEntity<Map<String, Object>> getSystemConfig() {
        Map<String, Object> config = new HashMap<>();
        
        // Code execution is optional and only enabled if a valid backend sandbox is configured
        boolean executionEnabled = executionServiceUrl != null && !executionServiceUrl.trim().isEmpty();
        config.put("codeExecutionEnabled", executionEnabled);
        
        if (!executionEnabled) {
            config.put("codeExecutionStatusMessage", "Code execution is not configured yet.");
        } else {
            config.put("codeExecutionStatusMessage", "Configured");
        }

        config.put("liveKitConfigured", livekitUrl != null && !livekitUrl.trim().isEmpty());
        config.put("collaborationPort", collaborationPort);
        config.put("maxRoomParticipants", 6);
        config.put("version", "1.0.0");

        return ResponseEntity.ok(config);
    }
}
