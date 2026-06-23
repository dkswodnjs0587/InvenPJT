package com.invenpjt.backend.member;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final String MEMBER_ID = "LOGIN_MEMBER_ID";
    private final MemberService memberService;

    public AuthController(MemberService memberService) {
        this.memberService = memberService;
    }

    @PostMapping("/signup")
    public ResponseEntity<MemberResponse> signup(@Valid @RequestBody AuthRequest.Signup request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(memberService.signup(request));
    }

    @PostMapping("/login")
    public MemberResponse login(@Valid @RequestBody AuthRequest.Login request, HttpSession session) {
        MemberResponse member = memberService.login(request);
        session.setAttribute(MEMBER_ID, member.id());
        return member;
    }

    @GetMapping("/me")
    public MemberResponse me(HttpSession session) {
        Object memberId = session.getAttribute(MEMBER_ID);
        if (!(memberId instanceof Long id)) {
            throw new org.springframework.web.server.ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }
        return memberService.findById(id);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.noContent().build();
    }
}
