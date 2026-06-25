package com.invenpjt.backend.member;

import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class MemberService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    public MemberService(MemberRepository memberRepository, PasswordEncoder passwordEncoder) {
        this.memberRepository = memberRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public MemberResponse signup(AuthRequest.Signup request) {
        String username = request.username().trim();
        String nickname = request.nickname().trim();
        String email = request.email().trim().toLowerCase(Locale.ROOT);

        if (memberRepository.existsByUsername(username)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 사용 중인 아이디입니다.");
        }
        if (memberRepository.existsByNickname(nickname)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 사용 중인 닉네임입니다.");
        }
        if (memberRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 사용 중인 이메일입니다.");
        }

        Member member = memberRepository.save(new Member(
                username, nickname, email, passwordEncoder.encode(request.password())));
        return MemberResponse.from(member);
    }

    public MemberResponse login(AuthRequest.Login request) {
        Member member = memberRepository.findByUsername(request.username().trim())
                .orElseThrow(() -> invalidCredentials());
        if (!passwordEncoder.matches(request.password(), member.getPasswordHash())) {
            throw invalidCredentials();
        }
        return MemberResponse.from(member);
    }

    public MemberResponse findById(Long id) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다."));
        return MemberResponse.from(member);
    }

    private ResponseStatusException invalidCredentials() {
        return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "아이디 또는 비밀번호가 올바르지 않습니다.");
    }
}
