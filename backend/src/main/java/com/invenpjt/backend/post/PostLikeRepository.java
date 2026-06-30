package com.invenpjt.backend.post;

import com.invenpjt.backend.member.Member;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PostLikeRepository extends JpaRepository<PostLike, Long> {

    long countByPost(Post post);

    boolean existsByPostAndMember(Post post, Member member);

    Optional<PostLike> findByPostAndMember(Post post, Member member);

    @Query("select l.post.id as postId, count(l) as count from PostLike l where l.post.id in :postIds group by l.post.id")
    List<PostCountSummary> countByPostIds(@Param("postIds") Collection<Long> postIds);

    @Query("select l.post.id from PostLike l where l.member = :member and l.post.id in :postIds")
    List<Long> findPostIdsByMemberAndPostIds(@Param("member") Member member, @Param("postIds") Collection<Long> postIds);
}
