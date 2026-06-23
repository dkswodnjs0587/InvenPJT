package com.invenpjt.backend.post;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @GetMapping("/boards/{boardSlug}/posts")
    public List<PostResponse> getPostsByBoard(@PathVariable String boardSlug) {
        return postService.getPostsByBoard(boardSlug);
    }

    @GetMapping("/posts/latest")
    public List<PostResponse> getLatestPosts() {
        return postService.getLatestPosts();
    }

    @GetMapping("/posts/{postId}")
    public PostResponse getPost(@PathVariable Long postId) {
        return postService.getPost(postId);
    }

    @PostMapping("/posts")
    public PostResponse createPost(@Valid @RequestBody PostRequest request) {
        return postService.createPost(request);
    }

    @PutMapping("/posts/{postId}")
    public PostResponse updatePost(@PathVariable Long postId, @Valid @RequestBody PostRequest request) {
        return postService.updatePost(postId, request);
    }

    @DeleteMapping("/posts/{postId}")
    public void deletePost(@PathVariable Long postId) {
        postService.deletePost(postId);
    }
}

