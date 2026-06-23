package com.invenpjt.backend.post;

import com.invenpjt.backend.board.Board;
import com.invenpjt.backend.board.BoardRepository;
import jakarta.transaction.Transactional;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class PostService {

    private final BoardRepository boardRepository;
    private final PostRepository postRepository;

    public PostService(BoardRepository boardRepository, PostRepository postRepository) {
        this.boardRepository = boardRepository;
        this.postRepository = postRepository;
    }

    public List<PostResponse> getPostsByBoard(String boardSlug) {
        Board board = getBoardBySlug(boardSlug);
        return postRepository.findByBoardOrderByCreatedAtDesc(board).stream()
                .map(PostResponse::from)
                .toList();
    }

    public List<PostResponse> getLatestPosts() {
        return postRepository.findTop10ByOrderByCreatedAtDesc().stream()
                .map(PostResponse::from)
                .toList();
    }

    @Transactional
    public PostResponse getPost(Long postId) {
        Post post = getPostById(postId);
        post.increaseViewCount();
        return PostResponse.from(post);
    }

    @Transactional
    public PostResponse createPost(PostRequest request) {
        Board board = getBoardBySlug(request.boardSlug());
        Post post = new Post(board, request.title(), request.content(), request.authorName());
        return PostResponse.from(postRepository.save(post));
    }

    @Transactional
    public PostResponse updatePost(Long postId, PostRequest request) {
        Post post = getPostById(postId);
        post.update(request.title(), request.content());
        return PostResponse.from(post);
    }

    public void deletePost(Long postId) {
        postRepository.deleteById(postId);
    }

    private Board getBoardBySlug(String boardSlug) {
        return boardRepository.findBySlug(boardSlug)
                .orElseThrow(() -> new IllegalArgumentException("Board not found: " + boardSlug));
    }

    private Post getPostById(Long postId) {
        return postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found: " + postId));
    }
}

