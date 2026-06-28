package com.invenpjt.backend.member;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public final class AuthRequest {
    private AuthRequest() {
    }

    public record Signup(
            @NotBlank @Pattern(regexp = "^[a-zA-Z0-9]{7,30}$", message = "아이디는 영문과 숫자 7~30자로 입력해 주세요.") String username,
            @NotBlank @Size(min = 2, max = 30, message = "닉네임은 2~30자로 입력해 주세요.") String nickname,
            @NotBlank @Email(message = "정확한 형식으로 이메일을 입력해 주세요.") @Size(max = 254) String email,
            @NotBlank @Size(min = 8, max = 72, message = "비밀번호는 8~72자로 입력해 주세요.") String password) {
    }

    public record Login(@NotBlank String username, @NotBlank String password, boolean rememberMe) {
    }

    public record PasswordFind(
            @NotBlank @Pattern(regexp = "^[a-zA-Z0-9]{7,30}$", message = "아이디 형식이 올바르지 않습니다.") String username,
            @NotBlank @Email(message = "정확한 형식으로 이메일을 입력해 주세요.") @Size(max = 254) String email) {
    }
}
