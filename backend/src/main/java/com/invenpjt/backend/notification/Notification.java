package com.invenpjt.backend.notification;

import com.invenpjt.backend.member.Member;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recipient_member_id")
    private Member recipient;

    @Column(nullable = false, length = 20)
    private String type;

    @Column(nullable = false, length = 50)
    private String actorName;

    @Column(nullable = false, length = 200)
    private String message;

    private Long postId;

    @Column(nullable = false)
    private boolean isRead = false;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    protected Notification() {
    }

    public Notification(Member recipient, String type, String actorName, String message, Long postId) {
        this.recipient = recipient;
        this.type = type;
        this.actorName = actorName;
        this.message = message;
        this.postId = postId;
    }

    public void markRead() {
        this.isRead = true;
    }

    public Long getId() { return id; }
    public Member getRecipient() { return recipient; }
    public String getType() { return type; }
    public String getActorName() { return actorName; }
    public String getMessage() { return message; }
    public Long getPostId() { return postId; }
    public boolean isRead() { return isRead; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
