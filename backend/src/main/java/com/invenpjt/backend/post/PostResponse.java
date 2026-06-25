package com.invenpjt.backend.post;

import java.time.LocalDateTime;

public record PostResponse(
        Long id,
        String boardName,
        String boardSlug,
        String title,
        String content,
        Long authorId,
        String authorName,
        int viewCount,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {

    public static PostResponse from(Post post) {
        return new PostResponse(
                post.getId(),
                post.getBoard().getName(),
                post.getBoard().getSlug(),
                post.getTitle(),
                post.getContent(),
                post.getAuthor() == null ? null : post.getAuthor().getId(),
                post.getAuthorName(),
                post.getViewCount(),
                post.getCreatedAt(),
                post.getUpdatedAt()
        );
    }
}
