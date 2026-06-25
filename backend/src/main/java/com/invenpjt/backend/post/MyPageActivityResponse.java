package com.invenpjt.backend.post;

import java.util.List;

public record MyPageActivityResponse(
        int postCount,
        int receivedCommentCount,
        int favoriteCount,
        List<PostResponse> myPosts,
        List<PostResponse> favoritePosts
) {
}
