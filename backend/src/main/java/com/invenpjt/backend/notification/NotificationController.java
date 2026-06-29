package com.invenpjt.backend.notification;

import com.invenpjt.backend.member.AuthController;
import jakarta.servlet.http.HttpSession;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public List<NotificationResponse> list(HttpSession session) {
        return notificationService.getNotifications(requireMemberId(session));
    }

    @GetMapping("/unread-count")
    public Map<String, Long> unreadCount(HttpSession session) {
        return Map.of("count", notificationService.getUnreadCount(requireMemberId(session)));
    }

    @PostMapping("/{notificationId}/read")
    public void markRead(@PathVariable Long notificationId, HttpSession session) {
        notificationService.markRead(requireMemberId(session), notificationId);
    }

    @PostMapping("/read-all")
    public void markAllRead(HttpSession session) {
        notificationService.markAllRead(requireMemberId(session));
    }

    private Long requireMemberId(HttpSession session) {
        Object memberId = session.getAttribute(AuthController.MEMBER_ID);
        if (memberId instanceof Long id) {
            return id;
        }
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
    }
}
