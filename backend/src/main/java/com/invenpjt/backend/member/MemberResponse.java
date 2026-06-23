package com.invenpjt.backend.member;

public record MemberResponse(Long id, String username, String nickname, String email) {
    public static MemberResponse from(Member member) {
        return new MemberResponse(member.getId(), member.getUsername(), member.getNickname(), member.getEmail());
    }
}
