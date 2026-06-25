package com.invenpjt.backend.search;

import java.time.LocalDateTime;

public record SearchKeywordResponse(
        Long id,
        String keyword,
        long searchCount,
        LocalDateTime updatedAt
) {
    public static SearchKeywordResponse from(SearchKeyword searchKeyword) {
        return new SearchKeywordResponse(
                searchKeyword.getId(),
                searchKeyword.getKeyword(),
                searchKeyword.getSearchCount(),
                searchKeyword.getUpdatedAt()
        );
    }
}
