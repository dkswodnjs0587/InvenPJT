package com.invenpjt.backend.post;

import java.util.List;

public record PostPageResponse(
        List<PostResponse> items,
        long totalItems,
        int totalPages,
        int page,
        int size
) {
}
