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
        if (boardRepository.count() > 0) {
            return;
        }

        boardRepository.save(new Board("자유 게시판", "free", "자유롭게 이야기를 나누는 공간"));
        boardRepository.save(new Board("공략 게시판", "guide", "팁과 공략을 정리하는 공간"));
        boardRepository.save(new Board("질문 게시판", "qna", "궁금한 점을 묻고 답하는 공간"));
    }
}

