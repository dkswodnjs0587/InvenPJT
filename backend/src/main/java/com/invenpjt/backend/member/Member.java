package com.invenpjt.backend.member;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "members")
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String username;

    @Column(nullable = false, unique = true, length = 30)
    private String nickname;

    @Column(nullable = false, unique = true, length = 254)
    private String email;

    @Column(nullable = false, length = 100)
    private String passwordHash;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false, columnDefinition = "boolean default true")
    private boolean notifyComment = true;

    @Column(nullable = false, columnDefinition = "boolean default true")
    private boolean notifyReaction = true;

    protected Member() {
    }

    public Member(String username, String nickname, String email, String passwordHash) {
        this.username = username;
        this.nickname = nickname;
        this.email = email;
        this.passwordHash = passwordHash;
        this.createdAt = LocalDateTime.now();
    }

    public void updateNotificationSettings(boolean notifyComment, boolean notifyReaction) {
        this.notifyComment = notifyComment;
        this.notifyReaction = notifyReaction;
    }

    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getNickname() { return nickname; }
    public String getEmail() { return email; }
    public String getPasswordHash() { return passwordHash; }
    public boolean isNotifyComment() { return notifyComment; }
    public boolean isNotifyReaction() { return notifyReaction; }
}
