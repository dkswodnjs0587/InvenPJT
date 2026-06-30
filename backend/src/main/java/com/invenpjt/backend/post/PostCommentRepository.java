package com.invenpjt.backend.post;

import com.invenpjt.backend.member.Member;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PostCommentRepository extends JpaRepository<PostComment, Long> {

    List<PostComment> findByPostOrderByCreatedAtAsc(Post post);

    long countByPost(Post post);

    @Query("select c.post.id as postId, count(c) as count from PostComment c where c.post.id in :postIds group by c.post.id")
    List<PostCountSummary> countByPostIds(@Param("postIds") Collection<Long> postIds);

    @Query("select count(c) from PostComment c where c.post.author = :member and c.author <> :member")
    long countReceivedByPostAuthor(@Param("member") Member member);
}
