package com.invenpjt.backend.post;

import com.invenpjt.backend.member.Member;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PostDislikeRepository extends JpaRepository<PostDislike, Long> {

    long countByPost(Post post);

    boolean existsByPostAndMember(Post post, Member member);

    Optional<PostDislike> findByPostAndMember(Post post, Member member);

    @Query("select d.post.id as postId, count(d) as count from PostDislike d where d.post.id in :postIds group by d.post.id")
    List<PostCountSummary> countByPostIds(@Param("postIds") Collection<Long> postIds);

    @Query("select d.post.id from PostDislike d where d.member = :member and d.post.id in :postIds")
    List<Long> findPostIdsByMemberAndPostIds(@Param("member") Member member, @Param("postIds") Collection<Long> postIds);
}
