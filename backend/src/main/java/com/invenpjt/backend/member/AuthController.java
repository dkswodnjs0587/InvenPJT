package com.invenpjt.backend.member;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import java.time.Duration;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    public static final String MEMBER_ID = "LOGIN_MEMBER_ID";
    private final MemberService memberService;

    public AuthController(MemberService memberService) {
        this.memberService = memberService;
    }

    @PostMapping("/signup")
    public ResponseEntity<MemberResponse> signup(@Valid @RequestBody AuthRequest.Signup request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(memberService.signup(request));
    }

    @PostMapping("/login")
    public MemberResponse login(@Valid @RequestBody AuthRequest.Login request, HttpSession session, HttpServletResponse response) {
        MemberResponse member = memberService.login(request);
        session.setAttribute(MEMBER_ID, member.id());

        // "로그인 유지" 선택 시 세션 쿠키를 영속 쿠키로 재발급해 브라우저를 닫아도 유지되게 한다.
        int maxAgeSeconds = request.rememberMe() ? (int) Duration.ofDays(14).getSeconds() : -1;
        if (request.rememberMe()) {
            session.setMaxInactiveInterval((int) Duration.ofDays(14).getSeconds());
        }
        Cookie sessionCookie = new Cookie("JSESSIONID", session.getId());
        sessionCookie.setPath("/");
        sessionCookie.setHttpOnly(true);
        sessionCookie.setMaxAge(maxAgeSeconds);
        response.addCookie(sessionCookie);
        return member;
    }

    @PostMapping("/password/find")
    public Map<String, String> findPassword(@Valid @RequestBody AuthRequest.PasswordFind request) {
        memberService.verifyPasswordResetTarget(request.username(), request.email());
        // 구현 단계: 실제 메일 발송은 하지 않고 안내 문구만 반환한다.
        return Map.of("message", "비밀번호를 재설정할 수 있는 링크를 이메일로 보냈습니다.");
    }

    @GetMapping("/me")
    public MemberResponse me(HttpSession session) {
        Object memberId = session.getAttribute(MEMBER_ID);
        if (!(memberId instanceof Long id)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }
        return memberService.findById(id);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.noContent().build();
    }
}
