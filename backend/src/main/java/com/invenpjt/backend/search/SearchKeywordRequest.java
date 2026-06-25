package com.invenpjt.backend.search;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SearchKeywordRequest(
        @NotBlank(message = "검색어를 입력해 주세요.")
        @Size(max = 80, message = "검색어는 80자 이하로 입력해 주세요.")
        String keyword
) {
}
