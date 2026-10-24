package com.synccode;

import com.synccode.exception.RoomCapacityExceededException;
import com.synccode.model.Room;
import com.synccode.model.RoomMembership;
import com.synccode.service.RoomService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;

import java.time.Instant;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class RoomCapacityTest {

    @Mock
    private MongoTemplate mongoTemplate;

    private RoomService roomService;

    @BeforeEach
    void setUp() {
        roomService = new RoomService(mongoTemplate);
    }

    @Test
    @DisplayName("Should strictly reject 7th participant when room capacity of 6 is reached")
    void testMaximumSixParticipantsCapacityEnforcement() {
        String roomId = "room-test-101";
        Room room = Room.builder()
                .id(roomId)
                .name("Test Coding Room")
                .maxParticipants(6)
                .status("ACTIVE")
                .invitationExpiresAt(Instant.now().plusSeconds(3600))
                .invitationRevoked(false)
                .build();

        when(mongoTemplate.findById(eq(roomId), eq(Room.class))).thenReturn(room);
        
        // Mock that 6 participants are already online
        when(mongoTemplate.count(any(Query.class), eq(RoomMembership.class))).thenReturn(6L);
        when(mongoTemplate.findOne(any(Query.class), eq(RoomMembership.class))).thenReturn(null);

        // Attempting to join as the 7th participant must throw RoomCapacityExceededException
        RoomCapacityExceededException exception = assertThrows(
                RoomCapacityExceededException.class,
                () -> roomService.joinRoom(roomId, "usr-7", "Engineer Seven", "seven@synccode.dev")
        );

        assertTrue(exception.getMessage().contains("Room capacity reached: 6 of 6 active participants"));
    }
}
