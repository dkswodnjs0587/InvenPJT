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
    private final PostLikeRepository postLikeRepository;
    private final PostDislikeRepository postDislikeRepository;
    private final PostBookmarkRepository postBookmarkRepository;
    private final PostCommentRepository postCommentRepository;
    private final CommentLikeRepository commentLikeRepository;
    private final CommentDislikeRepository commentDislikeRepository;

    public PostService(
            BoardRepository boardRepository,
            MemberRepository memberRepository,
            PostRepository postRepository,
            PostLikeRepository postLikeRepository,
            PostDislikeRepository postDislikeRepository,
            PostBookmarkRepository postBookmarkRepository,
            PostCommentRepository postCommentRepository,
            CommentLikeRepository commentLikeRepository,
            CommentDislikeRepository commentDislikeRepository
    ) {
        this.boardRepository = boardRepository;
        this.memberRepository = memberRepository;
        this.postRepository = postRepository;
        this.postLikeRepository = postLikeRepository;
        this.postDislikeRepository = postDislikeRepository;
        this.postBookmarkRepository = postBookmarkRepository;
        this.postCommentRepository = postCommentRepository;
        this.commentLikeRepository = commentLikeRepository;
        this.commentDislikeRepository = commentDislikeRepository;
    }

    @Transactional(readOnly = true)
    public List<PostResponse> getPostsByBoard(String boardSlug, Long currentMemberId) {
        Board board = getBoardBySlug(boardSlug);
        Member currentMember = findCurrentMember(currentMemberId);
        return postRepository.findByBoardOrderByCreatedAtDesc(board).stream()
                .map(post -> toPostResponse(post, currentMember))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PostResponse> getLatestPosts(Long currentMemberId) {
        Member currentMember = findCurrentMember(currentMemberId);
        return postRepository.findTop10ByOrderByCreatedAtDesc().stream()
                .map(post -> toPostResponse(post, currentMember))
                .toList();
    }

    @Transactional(readOnly = true)
    public MyPageActivityResponse getMyPageActivity(Long memberId) {
        Member member = getMemberById(memberId);
        List<PostResponse> myPosts = postRepository.findTop5ByAuthorOrderByCreatedAtDesc(member).stream()
                .map(post -> toPostResponse(post, member))
                .toList();
        List<PostResponse> favoritePosts = postBookmarkRepository.findTop5ByMemberOrderByCreatedAtDesc(member).stream()
                .map(bookmark -> toPostResponse(bookmark.getPost(), member))
                .toList();

        return new MyPageActivityResponse(
                Math.toIntExact(postRepository.countByAuthor(member)),
                Math.toIntExact(postCommentRepository.countReceivedByPostAuthor(member)),
                Math.toIntExact(postBookmarkRepository.countByMember(member)),
                myPosts,
                favoritePosts
        );
    }

    @Transactional
    public PostResponse getPost(Long postId, Long currentMemberId) {
        Post post = getPostById(postId);
        Member currentMember = findCurrentMember(currentMemberId);
        post.increaseViewCount();
        return toPostResponse(post, currentMember);
    }

    @Transactional
    public PostResponse createPost(PostRequest request, Long authorId) {
        Board board = getBoardBySlug(request.boardSlug());
        Member author = getMemberById(authorId);
        Post post = new Post(board, author, request.title().trim(), request.content().trim());
        return toPostResponse(postRepository.save(post), author);
    }

    @Transactional
    public PostResponse updatePost(Long postId, PostRequest request, Long memberId) {
        Post post = getPostById(postId);
        requireAuthor(post, memberId);
        post.update(request.title().trim(), request.content().trim());
        return toPostResponse(post, getMemberById(memberId));
    }

    @Transactional
    public void deletePost(Long postId, Long memberId) {
        Post post = getPostById(postId);
        requireAuthor(post, memberId);
        postRepository.delete(post);
    }

    @Transactional
    public PostResponse togglePostLike(Long postId, Long memberId) {
        Post post = getPostById(postId);
        Member member = getMemberById(memberId);
        if (post.isWrittenBy(memberId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "내 게시글은 추천할 수 없습니다.");
        }

        postLikeRepository.findByPostAndMember(post, member)
                .ifPresentOrElse(postLikeRepository::delete, () -> {
                    postDislikeRepository.findByPostAndMember(post, member).ifPresent(postDislikeRepository::delete);
                    postLikeRepository.save(new PostLike(post, member));
                });
        return toPostResponse(post, member);
    }

    @Transactional
    public PostResponse togglePostDislike(Long postId, Long memberId) {
        Post post = getPostById(postId);
        Member member = getMemberById(memberId);
        if (post.isWrittenBy(memberId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "내 게시글은 싫어요할 수 없습니다.");
        }

        postDislikeRepository.findByPostAndMember(post, member)
                .ifPresentOrElse(postDislikeRepository::delete, () -> {
                    postLikeRepository.findByPostAndMember(post, member).ifPresent(postLikeRepository::delete);
                    postDislikeRepository.save(new PostDislike(post, member));
                });
        return toPostResponse(post, member);
    }

    @Transactional
    public PostResponse togglePostBookmark(Long postId, Long memberId) {
        Post post = getPostById(postId);
        Member member = getMemberById(memberId);
        postBookmarkRepository.findByPostAndMember(post, member)
                .ifPresentOrElse(postBookmarkRepository::delete, () -> postBookmarkRepository.save(new PostBookmark(post, member)));
        return toPostResponse(post, member);
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> getComments(Long postId, Long currentMemberId) {
        Post post = getPostById(postId);
        Member currentMember = findCurrentMember(currentMemberId);
        return postCommentRepository.findByPostOrderByCreatedAtAsc(post).stream()
                .map(comment -> toCommentResponse(comment, currentMember))
                .toList();
    }

    @Transactional
    public CommentResponse createComment(Long postId, CommentRequest request, Long memberId) {
        Post post = getPostById(postId);
        Member author = getMemberById(memberId);
        PostComment comment = new PostComment(post, author, request.content().trim());
        return toCommentResponse(postCommentRepository.save(comment), author);
    }

    @Transactional
    public CommentResponse toggleCommentLike(Long commentId, Long memberId) {
        PostComment comment = getCommentById(commentId);
        Member member = getMemberById(memberId);
        commentLikeRepository.findByCommentAndMember(comment, member)
                .ifPresentOrElse(commentLikeRepository::delete, () -> {
                    commentDislikeRepository.findByCommentAndMember(comment, member).ifPresent(commentDislikeRepository::delete);
                    commentLikeRepository.save(new CommentLike(comment, member));
                });
        return toCommentResponse(comment, member);
    }

    @Transactional
    public CommentResponse toggleCommentDislike(Long commentId, Long memberId) {
        PostComment comment = getCommentById(commentId);
        Member member = getMemberById(memberId);
        commentDislikeRepository.findByCommentAndMember(comment, member)
                .ifPresentOrElse(commentDislikeRepository::delete, () -> {
                    commentLikeRepository.findByCommentAndMember(comment, member).ifPresent(commentLikeRepository::delete);
                    commentDislikeRepository.save(new CommentDislike(comment, member));
                });
        return toCommentResponse(comment, member);
    }

    private PostResponse toPostResponse(Post post, Member currentMember) {
        int likeCount = Math.toIntExact(postLikeRepository.countByPost(post));
        int dislikeCount = Math.toIntExact(postDislikeRepository.countByPost(post));
        int commentCount = Math.toIntExact(postCommentRepository.countByPost(post));
        boolean likedByMe = currentMember != null && postLikeRepository.existsByPostAndMember(post, currentMember);
        boolean dislikedByMe = currentMember != null && postDislikeRepository.existsByPostAndMember(post, currentMember);
        boolean bookmarkedByMe = currentMember != null && postBookmarkRepository.existsByPostAndMember(post, currentMember);
        return PostResponse.from(post, likeCount, dislikeCount, commentCount, likedByMe, dislikedByMe, bookmarkedByMe);
    }

    private CommentResponse toCommentResponse(PostComment comment, Member currentMember) {
        int likeCount = Math.toIntExact(commentLikeRepository.countByComment(comment));
        int dislikeCount = Math.toIntExact(commentDislikeRepository.countByComment(comment));
        boolean likedByMe = currentMember != null && commentLikeRepository.existsByCommentAndMember(comment, currentMember);
        boolean dislikedByMe = currentMember != null && commentDislikeRepository.existsByCommentAndMember(comment, currentMember);
        return new CommentResponse(
                comment.getId(),
                comment.getPost().getId(),
                comment.getAuthor().getId(),
                comment.getAuthorName(),
                comment.getContent(),
                likeCount,
                dislikeCount,
                likedByMe,
                dislikedByMe,
                comment.getCreatedAt(),
                comment.getUpdatedAt()
        );
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

    private Member findCurrentMember(Long memberId) {
        if (memberId == null) return null;
        return memberRepository.findById(memberId).orElse(null);
    }

    private Member getMemberById(Long memberId) {
        return memberRepository.findById(memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다."));
    }

    private Post getPostById(Long postId) {
        return postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "게시글을 찾을 수 없습니다."));
    }

    private PostComment getCommentById(Long commentId) {
        return postCommentRepository.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "댓글을 찾을 수 없습니다."));
    }
}
