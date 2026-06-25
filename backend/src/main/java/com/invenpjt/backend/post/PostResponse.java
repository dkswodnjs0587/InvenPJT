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
        int likeCount,
        int dislikeCount,
        int commentCount,
        boolean likedByMe,
        boolean dislikedByMe,
        boolean bookmarkedByMe,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {

    public static PostResponse from(Post post) {
        return from(post, 0, 0, 0, false, false, false);
    }

    public static PostResponse from(Post post, int likeCount, int dislikeCount, int commentCount, boolean likedByMe, boolean dislikedByMe, boolean bookmarkedByMe) {
        return new PostResponse(
                post.getId(),
                post.getBoard().getName(),
                post.getBoard().getSlug(),
                post.getTitle(),
                post.getContent(),
                post.getAuthor() == null ? null : post.getAuthor().getId(),
                post.getAuthorName(),
                post.getViewCount(),
                likeCount,
                dislikeCount,
                commentCount,
                likedByMe,
                dislikedByMe,
                bookmarkedByMe,
                post.getCreatedAt(),
                post.getUpdatedAt()
        );
    }
}
