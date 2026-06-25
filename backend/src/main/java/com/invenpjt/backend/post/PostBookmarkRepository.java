package com.invenpjt.backend.post;

import com.invenpjt.backend.member.Member;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostBookmarkRepository extends JpaRepository<PostBookmark, Long> {

    long countByMember(Member member);

    boolean existsByPostAndMember(Post post, Member member);

    Optional<PostBookmark> findByPostAndMember(Post post, Member member);

    List<PostBookmark> findTop5ByMemberOrderByCreatedAtDesc(Member member);
}
