package com.invenpjt.backend.notification;

import java.time.LocalDateTime;

public record NotificationResponse(
        Long id,
        String type,
        String actorName,
        String message,
        Long postId,
        boolean read,
        LocalDateTime createdAt
) {
    public static NotificationResponse from(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getType(),
                notification.getActorName(),
                notification.getMessage(),
                notification.getPostId(),
                notification.isRead(),
                notification.getCreatedAt()
        );
    }
}
