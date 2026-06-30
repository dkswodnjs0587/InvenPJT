package com.invenpjt.backend.post;

import java.time.LocalDateTime;

public record PostSummaryRow(
        Long id,
        String boardName,
        String boardSlug,
        String title,
        String content,
        Long authorId,
        String authorName,
        int viewCount,
        long likeCount,
        long dislikeCount,
        long commentCount,
        boolean likedByMe,
        boolean dislikedByMe,
        boolean bookmarkedByMe,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public PostResponse toResponse() {
        return new PostResponse(
                id,
                boardName,
                boardSlug,
                title,
                content,
                authorId,
                authorName,
                viewCount,
                Math.toIntExact(likeCount),
                Math.toIntExact(dislikeCount),
                Math.toIntExact(commentCount),
                likedByMe,
                dislikedByMe,
                bookmarkedByMe,
                createdAt,
                updatedAt
        );
    }
}
