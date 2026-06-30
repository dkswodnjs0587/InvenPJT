package com.invenpjt.backend.post;

import com.invenpjt.backend.member.Member;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PostBookmarkRepository extends JpaRepository<PostBookmark, Long> {

    long countByMember(Member member);

    boolean existsByPostAndMember(Post post, Member member);

    Optional<PostBookmark> findByPostAndMember(Post post, Member member);

    List<PostBookmark> findTop5ByMemberOrderByCreatedAtDesc(Member member);

    @Query("select b.post.id from PostBookmark b where b.member = :member and b.post.id in :postIds")
    List<Long> findPostIdsByMemberAndPostIds(@Param("member") Member member, @Param("postIds") Collection<Long> postIds);

    @Query("""
            select new com.invenpjt.backend.post.PostSummaryRow(
                p.id,
                p.board.name,
                p.board.slug,
                p.title,
                p.content,
                p.author.id,
                p.author.nickname,
                p.viewCount,
                (select count(l) from PostLike l where l.post = p),
                (select count(d) from PostDislike d where d.post = p),
                (select count(c) from PostComment c where c.post = p),
                case when exists (
                    select 1 from PostLike ml where ml.post = p and ml.member = :member
                ) then true else false end,
                case when exists (
                    select 1 from PostDislike md where md.post = p and md.member = :member
                ) then true else false end,
                true,
                p.createdAt,
                p.updatedAt
            )
            from PostBookmark b
            join b.post p
            where b.member = :member
            order by b.createdAt desc
            """)
    List<PostSummaryRow> findBookmarkedPostSummaries(@Param("member") Member member, Pageable pageable);
}
