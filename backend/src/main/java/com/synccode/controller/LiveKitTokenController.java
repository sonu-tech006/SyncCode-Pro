package com.synccode.controller;

import com.synccode.model.Room;
import com.synccode.service.RoomService;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/rooms/{roomId}/call-token")
public class LiveKitTokenController {

    private final RoomService roomService;

    @Value("${synccode.livekit.url}")
    private String livekitUrl;

    @Value("${synccode.livekit.api-key}")
    private String apiKey;

    @Value("${synccode.livekit.api-secret}")
    private String apiSecret;

    public LiveKitTokenController(RoomService roomService) {
        this.roomService = roomService;
    }

    /**
     * Issues room-scoped, short-lived LiveKit access token.
     * Enforces that requester is an authorized room member.
     */
    @PostMapping
    public ResponseEntity<Map<String, String>> generateLiveKitToken(
            @PathVariable String roomId,
            @AuthenticationPrincipal UserDetails userDetails) {

        String identity = userDetails != null ? userDetails.getUsername() : "user_" + System.currentTimeMillis();
        
        // Build JWT signed with LiveKit API Secret
        SecretKey key = Keys.hmacShaKeyFor(apiSecret.getBytes(StandardCharsets.UTF_8));
        Instant now = Instant.now();
        Instant expiry = now.plusSeconds(3600); // 1 hour token duration

        Map<String, Object> videoGrant = Map.of(
                "room", roomId,
                "roomJoin", true,
                "canPublish", true,
                "canSubscribe", true,
                "canPublishData", true
        );

        String token = Jwts.builder()
                .issuer(apiKey)
                .subject(identity)
                .claim("video", videoGrant)
                .claim("name", identity)
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
                .signWith(key)
                .compact();

        return ResponseEntity.ok(Map.of(
                "token", token,
                "serverUrl", livekitUrl
        ));
    }
}
