package com.invenpjt.backend.post;

import com.invenpjt.backend.board.Board;
import com.invenpjt.backend.board.BoardRepository;
import com.invenpjt.backend.member.Member;
import com.invenpjt.backend.member.MemberRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PostService {

    private final BoardRepository boardRepository;
    private final MemberRepository memberRepository;
    private final PostRepository postRepository;

    public PostService(BoardRepository boardRepository, MemberRepository memberRepository, PostRepository postRepository) {
        this.boardRepository = boardRepository;
        this.memberRepository = memberRepository;
        this.postRepository = postRepository;
    }

    @Transactional(readOnly = true)
    public List<PostResponse> getPostsByBoard(String boardSlug) {
        Board board = getBoardBySlug(boardSlug);
        return postRepository.findByBoardOrderByCreatedAtDesc(board).stream()
                .map(PostResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
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
    public PostResponse createPost(PostRequest request, Long authorId) {
        Board board = getBoardBySlug(request.boardSlug());
        Member author = getMemberById(authorId);
        Post post = new Post(board, author, request.title().trim(), request.content().trim());
        return PostResponse.from(postRepository.save(post));
    }

    @Transactional
    public PostResponse updatePost(Long postId, PostRequest request, Long memberId) {
        Post post = getPostById(postId);
        requireAuthor(post, memberId);
        post.update(request.title().trim(), request.content().trim());
        return PostResponse.from(post);
    }

    @Transactional
    public void deletePost(Long postId, Long memberId) {
        Post post = getPostById(postId);
        requireAuthor(post, memberId);
        postRepository.delete(post);
    }

    private void requireAuthor(Post post, Long memberId) {
        if (!post.isWrittenBy(memberId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "본인이 작성한 글만 수정하거나 삭제할 수 있습니다.");
        }
    }

    private Board getBoardBySlug(String boardSlug) {
        return boardRepository.findBySlug(boardSlug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "게시판을 찾을 수 없습니다."));
    }

    private Member getMemberById(Long memberId) {
        return memberRepository.findById(memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다."));
    }

    private Post getPostById(Long postId) {
        return postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "게시글을 찾을 수 없습니다."));
    }
}
