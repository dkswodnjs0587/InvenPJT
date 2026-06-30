package com.invenpjt.backend.post;

import com.invenpjt.backend.board.Board;
import com.invenpjt.backend.member.Member;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PostRepository extends JpaRepository<Post, Long> {

    List<Post> findByBoardOrderByCreatedAtDesc(Board board);

    List<Post> findTop10ByOrderByCreatedAtDesc();

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
                case when :currentMemberId is null then false when exists (
                    select 1 from PostLike ml where ml.post = p and ml.member.id = :currentMemberId
                ) then true else false end,
                case when :currentMemberId is null then false when exists (
                    select 1 from PostDislike md where md.post = p and md.member.id = :currentMemberId
                ) then true else false end,
                case when :currentMemberId is null then false when exists (
                    select 1 from PostBookmark mb where mb.post = p and mb.member.id = :currentMemberId
                ) then true else false end,
                p.createdAt,
                p.updatedAt
            )
            from Post p
            where p.board = :board
            order by p.createdAt desc
            """)
    List<PostSummaryRow> findSummariesByBoard(@Param("board") Board board, @Param("currentMemberId") Long currentMemberId);

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
                case when :currentMemberId is null then false when exists (
                    select 1 from PostLike ml where ml.post = p and ml.member.id = :currentMemberId
                ) then true else false end,
                case when :currentMemberId is null then false when exists (
                    select 1 from PostDislike md where md.post = p and md.member.id = :currentMemberId
                ) then true else false end,
                case when :currentMemberId is null then false when exists (
                    select 1 from PostBookmark mb where mb.post = p and mb.member.id = :currentMemberId
                ) then true else false end,
                p.createdAt,
                p.updatedAt
            )
            from Post p
            where p.board = :board
              and (
                :keyword is null
                or (:scope = 'all' and (
                    lower(p.title) like :keyword
                    or lower(p.content) like :keyword
                    or lower(p.author.nickname) like :keyword
                ))
                or (:scope = 'title' and lower(p.title) like :keyword)
                or (:scope = 'content' and lower(p.content) like :keyword)
                or (:scope = 'author' and lower(p.author.nickname) like :keyword)
              )
            order by
              case when :sort = 'likes' then (select count(l2) from PostLike l2 where l2.post = p) else 0 end desc,
              case when :sort = 'views' then p.viewCount else 0 end desc,
              p.createdAt desc
            """)
    List<PostSummaryRow> findPagedSummariesByBoard(
            @Param("board") Board board,
            @Param("currentMemberId") Long currentMemberId,
            @Param("keyword") String keyword,
            @Param("scope") String scope,
            @Param("sort") String sort,
            Pageable pageable
    );

    @Query("""
            select count(p)
            from Post p
            where p.board = :board
              and (
                :keyword is null
                or (:scope = 'all' and (
                    lower(p.title) like :keyword
                    or lower(p.content) like :keyword
                    or lower(p.author.nickname) like :keyword
                ))
                or (:scope = 'title' and lower(p.title) like :keyword)
                or (:scope = 'content' and lower(p.content) like :keyword)
                or (:scope = 'author' and lower(p.author.nickname) like :keyword)
              )
            """)
    long countSummariesByBoard(
            @Param("board") Board board,
            @Param("keyword") String keyword,
            @Param("scope") String scope
    );

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
                case when :currentMemberId is null then false when exists (
                    select 1 from PostLike ml where ml.post = p and ml.member.id = :currentMemberId
                ) then true else false end,
                case when :currentMemberId is null then false when exists (
                    select 1 from PostDislike md where md.post = p and md.member.id = :currentMemberId
                ) then true else false end,
                case when :currentMemberId is null then false when exists (
                    select 1 from PostBookmark mb where mb.post = p and mb.member.id = :currentMemberId
                ) then true else false end,
                p.createdAt,
                p.updatedAt
            )
            from Post p
            order by p.createdAt desc
            """)
    List<PostSummaryRow> findLatestSummaries(@Param("currentMemberId") Long currentMemberId, Pageable pageable);

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
                case when exists (
                    select 1 from PostBookmark mb where mb.post = p and mb.member = :member
                ) then true else false end,
                p.createdAt,
                p.updatedAt
            )
            from Post p
            where p.author = :member
            order by p.createdAt desc
            """)
    List<PostSummaryRow> findAuthorSummaries(@Param("member") Member member, Pageable pageable);

    long countByAuthor(Member author);

    List<Post> findTop5ByAuthorOrderByCreatedAtDesc(Member author);
}
