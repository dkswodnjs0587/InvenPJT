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
        name = "post_dislikes",
        uniqueConstraints = @UniqueConstraint(name = "uk_post_dislikes_post_member", columnNames = {"post_id", "member_id"}),
        indexes = {
                @Index(name = "idx_post_dislikes_post", columnList = "post_id"),
                @Index(name = "idx_post_dislikes_member", columnList = "member_id")
        }
)
public class PostDislike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "post_id")
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "member_id")
    private Member member;

    private LocalDateTime createdAt = LocalDateTime.now();

    protected PostDislike() {
    }

    public PostDislike(Post post, Member member) {
        this.post = post;
        this.member = member;
    }

    public Long getId() { return id; }
    public Post getPost() { return post; }
    public Member getMember() { return member; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
