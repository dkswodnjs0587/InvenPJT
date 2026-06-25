package com.invenpjt.backend.post;

import com.invenpjt.backend.board.Board;
import com.invenpjt.backend.member.Member;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostRepository extends JpaRepository<Post, Long> {

    List<Post> findByBoardOrderByCreatedAtDesc(Board board);

    List<Post> findTop10ByOrderByCreatedAtDesc();

    long countByAuthor(Member author);

    List<Post> findTop5ByAuthorOrderByCreatedAtDesc(Member author);
}
