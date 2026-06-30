package com.invenpjt.backend.search;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SearchKeywordService {

    // 한 사람(세션)이 같은 검색어로 카운트를 올릴 수 있는 최소 간격: 10분.
    // 무분별한 반복 검색으로 실시간 검색어를 띄우는 것을 방지한다.
    private static final Duration THROTTLE_WINDOW = Duration.ofMinutes(10);

    private final SearchKeywordRepository searchKeywordRepository;
    private final Map<String, Instant> lastCountedAt = new ConcurrentHashMap<>();

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
    public SearchKeywordResponse recordKeyword(SearchKeywordRequest request, String identity) {
        String keyword = normalize(request.keyword());
        String throttleKey = identity + "::" + keyword;
        Instant now = Instant.now();
        Instant last = lastCountedAt.get(throttleKey);
        boolean throttled = last != null && Duration.between(last, now).compareTo(THROTTLE_WINDOW) < 0;

        return searchKeywordRepository.findByKeyword(keyword)
                .map(searchKeyword -> {
                    if (!throttled) {
                        searchKeyword.increaseCount();
                        lastCountedAt.put(throttleKey, now);
                    }
                    return SearchKeywordResponse.from(searchKeyword);
                })
                .orElseGet(() -> {
                    lastCountedAt.put(throttleKey, now);
                    return SearchKeywordResponse.from(searchKeywordRepository.save(new SearchKeyword(keyword)));
                });
    }

    private String normalize(String keyword) {
        return keyword.trim().replaceAll("\\s+", " ");
    }
}
