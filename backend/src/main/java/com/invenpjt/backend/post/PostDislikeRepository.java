package com.invenpjt.backend.post;

import com.invenpjt.backend.member.Member;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostDislikeRepository extends JpaRepository<PostDislike, Long> {

    long countByPost(Post post);

    boolean existsByPostAndMember(Post post, Member member);

    Optional<PostDislike> findByPostAndMember(Post post, Member member);
}
