package com.invenpjt.backend.post;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostLikeRepository extends JpaRepository<PostLike, Long> {

    long countByPost(Post post);

    boolean existsByPostAndMember(Post post, com.invenpjt.backend.member.Member member);

    Optional<PostLike> findByPostAndMember(Post post, com.invenpjt.backend.member.Member member);
}
