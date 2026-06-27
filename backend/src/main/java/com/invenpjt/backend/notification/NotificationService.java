package com.invenpjt.backend.notification;

import com.invenpjt.backend.member.Member;
import com.invenpjt.backend.member.MemberRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class NotificationService {

    private static final int MAX_TITLE_LENGTH = 20;

    private final NotificationRepository notificationRepository;
    private final MemberRepository memberRepository;

    public NotificationService(NotificationRepository notificationRepository, MemberRepository memberRepository) {
        this.notificationRepository = notificationRepository;
        this.memberRepository = memberRepository;
    }

    @Transactional
    public void notifyComment(Member recipient, String actorName, String postTitle, Long postId) {
        if (recipient == null || !recipient.isNotifyComment()) {
            return;
        }
        String message = actorName + "님이 '" + shorten(postTitle) + "' 글에 댓글을 남겼습니다.";
        notificationRepository.save(new Notification(recipient, "COMMENT", actorName, message, postId));
    }

    @Transactional
    public void notifyPostLike(Member recipient, String actorName, String postTitle, Long postId) {
        if (recipient == null || !recipient.isNotifyReaction()) {
            return;
        }
        String message = actorName + "님이 '" + shorten(postTitle) + "' 글을 추천했습니다.";
        notificationRepository.save(new Notification(recipient, "POST_LIKE", actorName, message, postId));
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getNotifications(Long memberId) {
        Member member = getMemberById(memberId);
        return notificationRepository.findTop30ByRecipientOrderByCreatedAtDesc(member).stream()
                .map(NotificationResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Long memberId) {
        return notificationRepository.countByRecipientAndIsReadFalse(getMemberById(memberId));
    }

    @Transactional
    public void markRead(Long memberId, Long notificationId) {
        Member member = getMemberById(memberId);
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "알림을 찾을 수 없습니다."));
        if (!notification.getRecipient().getId().equals(member.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "본인의 알림만 처리할 수 있습니다.");
        }
        notification.markRead();
    }

    @Transactional
    public void markAllRead(Long memberId) {
        notificationRepository.markAllReadByRecipient(getMemberById(memberId));
    }

    @Transactional(readOnly = true)
    public NotificationSettingsResponse getSettings(Long memberId) {
        Member member = getMemberById(memberId);
        return new NotificationSettingsResponse(member.isNotifyComment(), member.isNotifyReaction());
    }

    @Transactional
    public NotificationSettingsResponse updateSettings(Long memberId, NotificationSettingsRequest request) {
        Member member = getMemberById(memberId);
        member.updateNotificationSettings(request.notifyComment(), request.notifyReaction());
        return new NotificationSettingsResponse(member.isNotifyComment(), member.isNotifyReaction());
    }

    private String shorten(String title) {
        if (title == null) {
            return "";
        }
        String trimmed = title.trim();
        return trimmed.length() > MAX_TITLE_LENGTH ? trimmed.substring(0, MAX_TITLE_LENGTH) + "…" : trimmed;
    }

    private Member getMemberById(Long memberId) {
        return memberRepository.findById(memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다."));
    }
}
