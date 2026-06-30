package com.invenpjt.backend.search;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/search-keywords")
public class SearchKeywordController {

    private final SearchKeywordService searchKeywordService;

    public SearchKeywordController(SearchKeywordService searchKeywordService) {
        this.searchKeywordService = searchKeywordService;
    }

    @GetMapping("/realtime")
    public List<SearchKeywordResponse> getRealtimeKeywords() {
        return searchKeywordService.getRealtimeKeywords();
    }

    @PostMapping
    public SearchKeywordResponse recordKeyword(@Valid @RequestBody SearchKeywordRequest request, HttpSession session) {
        return searchKeywordService.recordKeyword(request, session.getId());
    }
}
