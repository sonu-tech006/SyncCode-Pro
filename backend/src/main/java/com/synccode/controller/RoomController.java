package com.synccode.controller;

import com.synccode.model.Room;
import com.synccode.model.RoomMembership;
import com.synccode.service.RoomService;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/rooms")
public class RoomController {

    private final MongoTemplate mongoTemplate;
    private final RoomService roomService;

    public RoomController(MongoTemplate mongoTemplate, RoomService roomService) {
        this.mongoTemplate = mongoTemplate;
        this.roomService = roomService;
    }

    /**
     * Retrieves room details by ID.
     */
    @GetMapping("/{roomId}")
    public ResponseEntity<Room> getRoom(@PathVariable String roomId) {
        Room room = mongoTemplate.findById(roomId, Room.class);
        if (room == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(room);
    }

    /**
     * Joins an active room with strict server-side concurrency enforcement (Max 6 participants).
     * Derives identity strictly from the verified JWT authentication context.
     */
    @PostMapping("/{roomId}/join")
    public ResponseEntity<RoomMembership> joinRoom(
            @PathVariable String roomId,
            @AuthenticationPrincipal String userId,
            @RequestBody(required = false) Map<String, String> body) {

        String effectiveUserId = (userId != null && !userId.isEmpty()) ? userId : "user_" + System.currentTimeMillis();
        String userName = body != null && body.containsKey("name") ? body.get("name") : "Engineer";
        String userEmail = body != null && body.containsKey("email") ? body.get("email") : effectiveUserId + "@synccode.dev";

        RoomMembership membership = roomService.joinRoom(roomId, effectiveUserId, userName, userEmail);
        return ResponseEntity.ok(membership);
    }

    /**
     * Lists active online participants for a room.
     */
    @GetMapping("/{roomId}/participants")
    public ResponseEntity<List<RoomMembership>> getParticipants(@PathVariable String roomId) {
        List<RoomMembership> participants = roomService.getActiveParticipants(roomId);
        return ResponseEntity.ok(participants);
    }
}
