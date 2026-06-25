package com.invenpjt.backend.search;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SearchKeywordRepository extends JpaRepository<SearchKeyword, Long> {
    Optional<SearchKeyword> findByKeyword(String keyword);
    List<SearchKeyword> findTop10ByOrderBySearchCountDescUpdatedAtDesc();
}
