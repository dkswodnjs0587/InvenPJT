package com.invenpjt.backend.search;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "search_keywords")
public class SearchKeyword {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 80)
    private String keyword;

    @Column(nullable = false)
    private long searchCount;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    protected SearchKeyword() {
    }

    public SearchKeyword(String keyword) {
        this.keyword = keyword;
        this.searchCount = 1;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = this.createdAt;
    }

    public void increaseCount() {
        this.searchCount += 1;
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public String getKeyword() { return keyword; }
    public long getSearchCount() { return searchCount; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
