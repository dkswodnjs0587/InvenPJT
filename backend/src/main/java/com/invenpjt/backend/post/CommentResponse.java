package com.invenpjt.backend.post;

import java.time.LocalDateTime;

public record CommentResponse(
        Long id,
        Long postId,
        Long authorId,
        String authorName,
        String content,
        int likeCount,
        int dislikeCount,
        boolean likedByMe,
        boolean dislikedByMe,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
