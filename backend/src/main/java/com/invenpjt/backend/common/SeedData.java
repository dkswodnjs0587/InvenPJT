package com.invenpjt.backend.common;

import com.invenpjt.backend.board.Board;
import com.invenpjt.backend.board.BoardRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class SeedData implements CommandLineRunner {

    private final BoardRepository boardRepository;

    public SeedData(BoardRepository boardRepository) {
        this.boardRepository = boardRepository;
    }

    @Override
    public void run(String... args) {
        ensureBoard("LOL 자유게시판", "free", "LOL 라운지에서 자유롭게 이야기를 나누는 공간");
        ensureBoard("배드민턴 자유게시판", "badminton-free", "배드민턴 라운지에서 라켓, 경기, 모임 이야기를 나누는 공간");
        ensureBoard("공략 게시판", "guide", "게임 공략을 정리하고 공유하는 공간");
        ensureBoard("질문 게시판", "qna", "궁금한 점을 묻고 답하는 공간");
    }

    private void ensureBoard(String name, String slug, String description) {
        Board board = boardRepository.findBySlug(slug)
                .orElseGet(() -> new Board(name, slug, description));
        board.updateDetails(name, description);
        boardRepository.save(board);
    }
}
