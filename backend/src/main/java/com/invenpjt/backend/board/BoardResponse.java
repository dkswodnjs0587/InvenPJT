package com.invenpjt.backend.board;

public record BoardResponse(
        Long id,
        String name,
        String slug,
        String description
) {

    public static BoardResponse from(Board board) {
        return new BoardResponse(
                board.getId(),
                board.getName(),
                board.getSlug(),
                board.getDescription()
        );
    }
}

