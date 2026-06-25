package com.invenpjt.backend.search;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SearchKeywordService {

    private final SearchKeywordRepository searchKeywordRepository;

    public SearchKeywordService(SearchKeywordRepository searchKeywordRepository) {
        this.searchKeywordRepository = searchKeywordRepository;
    }

    @Transactional(readOnly = true)
    public List<SearchKeywordResponse> getRealtimeKeywords() {
        return searchKeywordRepository.findTop10ByOrderBySearchCountDescUpdatedAtDesc().stream()
                .map(SearchKeywordResponse::from)
                .toList();
    }

    @Transactional
    public SearchKeywordResponse recordKeyword(SearchKeywordRequest request) {
        String keyword = normalize(request.keyword());
        return searchKeywordRepository.findByKeyword(keyword)
                .map(searchKeyword -> {
                    searchKeyword.increaseCount();
                    return SearchKeywordResponse.from(searchKeyword);
                })
                .orElseGet(() -> SearchKeywordResponse.from(searchKeywordRepository.save(new SearchKeyword(keyword))));
    }

    private String normalize(String keyword) {
        return keyword.trim().replaceAll("\\s+", " ");
    }
}
