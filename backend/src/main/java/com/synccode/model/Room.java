package com.synccode.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "rooms")
public class Room {

    @Id
    private String id;

    @Indexed
    private String projectId;

    @Indexed
    private String ownerId;

    private String name;
    private String description;
    private String language;
    private String visibility; // PRIVATE or INVITE_ONLY

    @Indexed
    private String invitationTokenHash;
    private Instant invitationExpiresAt;
    private boolean invitationRevoked;

    @Builder.Default
    private int maxParticipants = 6; // Hard limit: strictly capped at 6 members

    @Builder.Default
    private String status = "ACTIVE";

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
