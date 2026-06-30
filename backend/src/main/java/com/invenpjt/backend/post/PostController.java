package com.invenpjt.backend.post;

import com.invenpjt.backend.member.AuthController;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @GetMapping("/boards/{boardSlug}/posts/page")
    public PostPageResponse getPostPageByBoard(
            @PathVariable String boardSlug,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(defaultValue = "latest") String sort,
            @RequestParam(required = false, name = "q") String query,
            @RequestParam(defaultValue = "all") String scope,
            HttpSession session
    ) {
        return postService.getPostPageByBoard(boardSlug, currentMemberId(session), page, size, sort, query, scope);
    }

    @GetMapping("/boards/{boardSlug}/posts")
    public List<PostResponse> getPostsByBoard(@PathVariable String boardSlug, HttpSession session) {
        return postService.getPostsByBoard(boardSlug, currentMemberId(session));
    }

    @GetMapping("/posts/latest")
    public List<PostResponse> getLatestPosts(HttpSession session) {
        return postService.getLatestPosts(currentMemberId(session));
    }

    @GetMapping("/members/me/activity")
    public MyPageActivityResponse getMyPageActivity(HttpSession session) {
        return postService.getMyPageActivity(requireMemberId(session));
    }

    @GetMapping("/posts/{postId}")
    public PostResponse getPost(@PathVariable Long postId, HttpSession session) {
        return postService.getPost(postId, currentMemberId(session));
    }

    @PostMapping("/posts")
    public PostResponse createPost(@Valid @RequestBody PostRequest request, HttpSession session) {
        return postService.createPost(request, requireMemberId(session));
    }

    @PutMapping("/posts/{postId}")
    public PostResponse updatePost(@PathVariable Long postId, @Valid @RequestBody PostRequest request, HttpSession session) {
        return postService.updatePost(postId, request, requireMemberId(session));
    }

    @DeleteMapping("/posts/{postId}")
    public void deletePost(@PathVariable Long postId, HttpSession session) {
        postService.deletePost(postId, requireMemberId(session));
    }

    @PostMapping("/posts/{postId}/likes")
    public PostResponse togglePostLike(@PathVariable Long postId, HttpSession session) {
        return postService.togglePostLike(postId, requireMemberId(session));
    }

    @PostMapping("/posts/{postId}/dislikes")
    public PostResponse togglePostDislike(@PathVariable Long postId, HttpSession session) {
        return postService.togglePostDislike(postId, requireMemberId(session));
    }

    @PostMapping("/posts/{postId}/bookmarks")
    public PostResponse togglePostBookmark(@PathVariable Long postId, HttpSession session) {
        return postService.togglePostBookmark(postId, requireMemberId(session));
    }

    @GetMapping("/posts/{postId}/comments")
    public List<CommentResponse> getComments(@PathVariable Long postId, HttpSession session) {
        return postService.getComments(postId, currentMemberId(session));
    }

    @PostMapping("/posts/{postId}/comments")
    public CommentResponse createComment(@PathVariable Long postId, @Valid @RequestBody CommentRequest request, HttpSession session) {
        return postService.createComment(postId, request, requireMemberId(session));
    }

    @PostMapping("/comments/{commentId}/likes")
    public CommentResponse toggleCommentLike(@PathVariable Long commentId, HttpSession session) {
        return postService.toggleCommentLike(commentId, requireMemberId(session));
    }

    @PostMapping("/comments/{commentId}/dislikes")
    public CommentResponse toggleCommentDislike(@PathVariable Long commentId, HttpSession session) {
        return postService.toggleCommentDislike(commentId, requireMemberId(session));
    }

    private Long currentMemberId(HttpSession session) {
        Object memberId = session.getAttribute(AuthController.MEMBER_ID);
        return memberId instanceof Long id ? id : null;
    }

    private Long requireMemberId(HttpSession session) {
        Long memberId = currentMemberId(session);
        if (memberId != null) {
            return memberId;
        }
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
    }
}
