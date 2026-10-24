package com.synccode.service;

import com.synccode.exception.RoomCapacityExceededException;
import com.synccode.exception.ResourceNotFoundException;
import com.synccode.exception.UnauthorizedException;
import com.synccode.model.Room;
import com.synccode.model.RoomMembership;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class RoomService {

    private final MongoTemplate mongoTemplate;

    public RoomService(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    /**
     * Atomically validates room capacity and joins member.
     * Prevents race conditions so no 7th active member can join.
     */
    public synchronized RoomMembership joinRoom(String roomId, String userId, String userName, String userEmail) {
        Room room = mongoTemplate.findById(roomId, Room.class);
        if (room == null || !"ACTIVE".equals(room.getStatus())) {
            throw new ResourceNotFoundException("Active room not found for ID: " + roomId);
        }

        if (room.isInvitationRevoked()) {
            throw new UnauthorizedException("This room invitation link has been revoked by the owner.");
        }

        if (room.getInvitationExpiresAt() != null && room.getInvitationExpiresAt().isBefore(Instant.now())) {
            throw new UnauthorizedException("This room invitation has expired.");
        }

        // Count current online members atomically
        Query activeQuery = new Query(Criteria.where("roomId").is(roomId).and("status").is("ONLINE"));
        long onlineCount = mongoTemplate.count(activeQuery, RoomMembership.class);

        // Check if user is already an active member
        Query userQuery = new Query(Criteria.where("roomId").is(roomId).and("userId").is(userId));
        RoomMembership existing = mongoTemplate.findOne(userQuery, RoomMembership.class);

        if (existing != null) {
            existing.setStatus("ONLINE");
            mongoTemplate.save(existing);
            return existing;
        }

        // Enforce maximum capacity of 6 participants strictly on server side
        if (onlineCount >= room.getMaxParticipants()) {
            throw new RoomCapacityExceededException(
                String.format("Room capacity reached: %d of %d active participants already in session.",
                    onlineCount, room.getMaxParticipants())
            );
        }

        RoomMembership newMember = RoomMembership.builder()
                .id(UUID.randomUUID().toString())
                .roomId(roomId)
                .userId(userId)
                .userName(userName)
                .userEmail(userEmail)
                .role("EDITOR")
                .status("ONLINE")
                .joinedAt(Instant.now())
                .build();

        return mongoTemplate.save(newMember);
    }

    public List<RoomMembership> getActiveParticipants(String roomId) {
        Query query = new Query(Criteria.where("roomId").is(roomId).and("status").is("ONLINE"));
        return mongoTemplate.find(query, RoomMembership.class);
    }
}
