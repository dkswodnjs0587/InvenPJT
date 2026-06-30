package com.invenpjt.backend.post;

import com.invenpjt.backend.member.Member;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "comment_likes",
        uniqueConstraints = @UniqueConstraint(name = "uk_comment_likes_comment_member", columnNames = {"comment_id", "member_id"}),
        indexes = {
                @Index(name = "idx_comment_likes_comment", columnList = "comment_id"),
                @Index(name = "idx_comment_likes_member", columnList = "member_id")
        }
)
public class CommentLike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "comment_id")
    private PostComment comment;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "member_id")
    private Member member;

    private LocalDateTime createdAt = LocalDateTime.now();

    protected CommentLike() {
    }

    public CommentLike(PostComment comment, Member member) {
        this.comment = comment;
        this.member = member;
    }

    public Long getId() { return id; }
    public PostComment getComment() { return comment; }
    public Member getMember() { return member; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
