package com.invenpjt.backend.post;

import com.invenpjt.backend.member.Member;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentDislikeRepository extends JpaRepository<CommentDislike, Long> {

    long countByComment(PostComment comment);

    boolean existsByCommentAndMember(PostComment comment, Member member);

    Optional<CommentDislike> findByCommentAndMember(PostComment comment, Member member);
}
