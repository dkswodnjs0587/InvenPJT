import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, FormEvent, ReactNode } from "react";
import "./App.css";

type Theme = "light" | "dark";
type View = "home" | "free" | "login" | "signup" | "mypage" | "lol" | "fifa" | "badminton";

type Category = {
  id: number;
  title: string;
  icon: string;
  color: string;
  description: string;
};

type BoardPost = {
  id: number;
  boardName: string;
  boardSlug: string;
  title: string;
  content: string;
  authorId: number | null;
  authorName: string;
  viewCount: number;
  likeCount: number;
  dislikeCount: number;
  commentCount: number;
  likedByMe: boolean;
  dislikedByMe: boolean;
  bookmarkedByMe: boolean;
  createdAt: string;
  updatedAt: string | null;
};

type BoardComment = {
  id: number;
  postId: number;
  authorId: number;
  authorName: string;
  content: string;
  likeCount: number;
  dislikeCount: number;
  likedByMe: boolean;
  dislikedByMe: boolean;
  createdAt: string;
  updatedAt: string | null;
};

type BoardRoute =
  | { mode: "list" }
  | { mode: "write" }
  | { mode: "detail"; postId: number };

type SortMode = "latest" | "likes" | "views";

type HomePost = {
  board: string;
  title: string;
  author: string;
  count: number;
  time: string;
  isHot?: boolean;
  isNew?: boolean;
};

type HotImagePost = {
  tag: string;
  title: string;
  image: string;
};

type Member = {
  id: number;
  username: string;
  nickname: string;
  email: string;
};

type MyPageActivity = {
  postCount: number;
  receivedCommentCount: number;
  favoriteCount: number;
  myPosts: BoardPost[];
  favoritePosts: BoardPost[];
};

type ToastMessage = {
  id: number;
  text: string;
};

type RealtimeKeyword = {
  id: number;
  keyword: string;
  searchCount: number;
  updatedAt: string;
};

type NotificationItem = {
  id: number;
  type: "COMMENT" | "POST_LIKE" | string;
  actorName: string;
  message: string;
  postId: number | null;
  read: boolean;
  createdAt: string;
};

function formatBoardTime(createdAt: string) {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "-";

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayDiff = Math.floor((today.getTime() - target.getTime()) / 86400000);

  if (dayDiff === 0) {
    return date.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
  }
  if (dayDiff === 1) return "어제";
  return date.toLocaleDateString("ko-KR");
}

function formatFullDateTime(createdAt: string) {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "-";
  const weekday = ["일", "월", "화", "수", "목", "금", "토"][date.getDay()];
  const hour = date.getHours();
  const minute = String(date.getMinutes()).padStart(2, "0");
  const ampm = hour < 12 ? "오전" : "오후";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${weekday}) ${ampm} ${hour12}:${minute}`;
}

function renderPostContent(content: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const imageRegex = /!\[[^\]]*\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let key = 0;
  let match: RegExpExecArray | null;
  while ((match = imageRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(<span key={key++}>{content.slice(lastIndex, match.index)}</span>);
    }
    nodes.push(<img key={key++} className="postImage" src={match[1]} alt="첨부 이미지" loading="lazy" />);
    lastIndex = imageRegex.lastIndex;
  }
  if (lastIndex < content.length) {
    nodes.push(<span key={key++}>{content.slice(lastIndex)}</span>);
  }
  return nodes;
}

function readBoardRoute(): BoardRoute {
  const params = new URLSearchParams(window.location.search);
  if (params.get("board") !== "free") return { mode: "list" };
  if (params.get("mode") === "write") return { mode: "write" };
  const postId = Number(params.get("post"));
  if (Number.isInteger(postId) && postId > 0) return { mode: "detail", postId };
  return { mode: "list" };
}

function FreeBoard({ onHome, onLolHome, onBadmintonHome, theme, onToggleTheme, member, onLogin, onSignup, onLogout, onMyPage = onHome, onNotify }: { onHome: () => void; onLolHome?: () => void; onBadmintonHome?: () => void; theme: Theme; onToggleTheme: () => void; member: Member | null; onLogin: () => void; onSignup: () => void; onLogout: () => void; onMyPage?: () => void; onNotify: (message: string) => void }) {
  const [posts, setPosts] = useState<BoardPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<BoardPost | null>(null);
  const [comments, setComments] = useState<BoardComment[]>([]);
  const [boardRoute, setBoardRoute] = useState<BoardRoute>(readBoardRoute);
  const [isWriting, setIsWriting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [writeTitle, setWriteTitle] = useState("");
  const [writeContent, setWriteContent] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [newComment, setNewComment] = useState("");
  const [pageSize, setPageSize] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortMode, setSortMode] = useState<SortMode>("latest");
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isCommentLoading, setIsCommentLoading] = useState(false);
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [isUpdatingPost, setIsUpdatingPost] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [error, setError] = useState("");
  const [detailError, setDetailError] = useState("");
  const [writeError, setWriteError] = useState("");
  const [editError, setEditError] = useState("");
  const [commentError, setCommentError] = useState("");
  const [commentSort, setCommentSort] = useState<"oldest" | "latest">("oldest");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [searchQuery, setSearchQuery] = useState(() => new URLSearchParams(window.location.search).get("q") ?? "");
  const [searchScope, setSearchScope] = useState(() => new URLSearchParams(window.location.search).get("scope") ?? "all");
  const loungeParam = new URLSearchParams(window.location.search).get("lounge");
  const isLolLoungeBoard = loungeParam === "lol";
  const isBadmintonLoungeBoard = loungeParam === "badminton";
  const boardHeroTitle = isLolLoungeBoard ? "LOL 자유게시판" : isBadmintonLoungeBoard ? "BADMINTON 자유게시판" : "자유 게시판";
  const boardHeroEyebrow = isLolLoungeBoard ? "LOL LOUNGE" : isBadmintonLoungeBoard ? "BADMINTON LOUNGE" : "FREE BOARD";
  const boardHeroDescription = isLolLoungeBoard ? "롤 라운지 자유게시판에서 자유롭게 이야기를 나누는 공간" : isBadmintonLoungeBoard ? "라켓, 셔틀콕, 동호회와 경기 이야기를 함께 나누는 공간" : "게임, 일상, 질문, 정보까지 자유롭게 이야기를 나누는 공간";
  const boardHomeHandler = isLolLoungeBoard ? onLolHome ?? onHome : isBadmintonLoungeBoard ? onBadmintonHome ?? onHome : onHome;
  const boardHeaderVariant = isLolLoungeBoard ? "lol" : isBadmintonLoungeBoard ? "badminton" : "main";

  const sortedComments = useMemo(() => {
    const next = [...comments];
    next.sort((a, b) => {
      const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return commentSort === "latest" ? -diff : diff;
    });
    return next;
  }, [comments, commentSort]);

  const sortedPosts = useMemo(() => {
    const nextPosts = [...posts];
    if (sortMode === "likes") {
      nextPosts.sort((a, b) => (b.likeCount ?? 0) - (a.likeCount ?? 0) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortMode === "views") {
      nextPosts.sort((a, b) => b.viewCount - a.viewCount || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      nextPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return nextPosts;
  }, [posts, sortMode]);

  const filteredPosts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return sortedPosts;
    return sortedPosts.filter((post) => {
      const inTitle = post.title.toLowerCase().includes(query);
      const inContent = post.content.toLowerCase().includes(query);
      const inAuthor = post.authorName.toLowerCase().includes(query);
      if (searchScope === "title") return inTitle;
      if (searchScope === "author") return inAuthor;
      if (searchScope === "content") return inContent;
      return inTitle || inContent || inAuthor;
    });
  }, [sortedPosts, searchQuery, searchScope]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const visiblePosts = filteredPosts.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize);

  const clearSearch = () => {
    setSearchQuery("");
    setSearchScope("all");
    const url = new URL(window.location.href);
    url.search = "";
    url.searchParams.set("board", "free");
    if (loungeParam) url.searchParams.set("lounge", loungeParam);
    window.history.pushState({ view: "free" }, "", url);
  };

  const formatDate = formatBoardTime;

  const buildBoardUrl = (route: BoardRoute) => {
    const url = new URL(window.location.href);
    url.search = "";
    url.searchParams.set("board", "free");
    if (loungeParam) url.searchParams.set("lounge", loungeParam);
    if (route.mode === "write") url.searchParams.set("mode", "write");
    if (route.mode === "detail") url.searchParams.set("post", String(route.postId));
    return url;
  };

  const navigateBoard = (route: BoardRoute, replace = false) => {
    const url = buildBoardUrl(route);
    window.history[replace ? "replaceState" : "pushState"]({ view: "free", boardRoute: route }, "", url);
    setBoardRoute(route);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const updatePostInList = (updatedPost: BoardPost) => {
    setPosts((currentPosts) => currentPosts.map((post) => post.id === updatedPost.id ? updatedPost : post));
    setSelectedPost((currentPost) => currentPost?.id === updatedPost.id ? updatedPost : currentPost);
  };

  const loadPosts = () => {
    setIsLoading(true);
    setError("");

    fetch("/api/boards/free/posts", { credentials: "include" })
      .then(async (response) => {
        if (!response.ok) throw new Error("게시글을 불러오지 못했습니다.");
        return await response.json() as BoardPost[];
      })
      .then(setPosts)
      .catch((caughtError) => {
        setError(caughtError instanceof Error ? caughtError.message : "잠시 후 다시 시도해 주세요.");
      })
      .finally(() => setIsLoading(false));
  };

  const loadComments = (postId: number) => {
    setIsCommentLoading(true);
    setCommentError("");

    fetch(`/api/posts/${postId}/comments`, { credentials: "include" })
      .then(async (response) => {
        if (!response.ok) throw new Error(await readError(response));
        return await response.json() as BoardComment[];
      })
      .then(setComments)
      .catch((caughtError) => {
        setCommentError(caughtError instanceof Error ? caughtError.message : "댓글을 불러오지 못했습니다.");
      })
      .finally(() => setIsCommentLoading(false));
  };

  const loadPostDetail = (postId: number) => {
    setSelectedPost(null);
    setComments([]);
    setIsDetailLoading(true);
    setDetailError("");

    fetch(`/api/posts/${postId}`, { credentials: "include" })
      .then(async (response) => {
        if (!response.ok) throw new Error("게시글 상세 정보를 불러오지 못했습니다.");
        return await response.json() as BoardPost;
      })
      .then((post) => {
        setSelectedPost(post);
        updatePostInList(post);
        loadComments(post.id);
      })
      .catch((caughtError) => {
        setDetailError(caughtError instanceof Error ? caughtError.message : "잠시 후 다시 시도해 주세요.");
      })
      .finally(() => setIsDetailLoading(false));
  };

  const openWriteForm = () => {
    if (!member) {
      onNotify("로그인이 필요합니다. 먼저 로그인해 주세요.");
      onLogin();
      return;
    }
    navigateBoard({ mode: "write" });
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploadingImage(true);
    setWriteError("");
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        const response = await fetch("/api/uploads/image", { method: "POST", credentials: "include", body: formData });
        if (!response.ok) throw new Error(await readError(response));
        const { url } = await response.json() as { url: string };
        setWriteContent((current) => `${current}${current && !current.endsWith("\n") ? "\n" : ""}![이미지](${url})\n`);
      }
      onNotify("사진을 추가했습니다.");
    } catch (caughtError) {
      setWriteError(caughtError instanceof Error ? caughtError.message : "사진 업로드에 실패했습니다.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const openPostDetail = (postId: number) => {
    navigateBoard({ mode: "detail", postId });
  };

  const backToList = () => {
    navigateBoard({ mode: "list" });
  };

  const submitPost = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setWriteError("");

    const title = writeTitle.trim();
    const content = writeContent.trim();

    if (!title) {
      setWriteError("제목을 입력해 주세요.");
      return;
    }

    if (!content) {
      setWriteError("내용을 입력해 주세요.");
      return;
    }

    setIsSubmittingPost(true);

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ boardSlug: "free", title, content }),
      });

      if (!response.ok) throw new Error(await readError(response));

      const createdPost = await response.json() as BoardPost;
      setPosts((currentPosts) => [createdPost, ...currentPosts]);
      setWriteTitle("");
      setWriteContent("");
      onNotify("글쓰기를 완료했습니다.");
      navigateBoard({ mode: "list" }, true);
    } catch (caughtError) {
      setWriteError(caughtError instanceof Error ? caughtError.message : "게시글을 등록하지 못했습니다.");
    } finally {
      setIsSubmittingPost(false);
    }
  };

  const isMyPost = (post: BoardPost) => member?.id === post.authorId;

  const beginEdit = () => {
    if (!selectedPost || !isMyPost(selectedPost)) return;
    setEditTitle(selectedPost.title);
    setEditContent(selectedPost.content);
    setEditError("");
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditTitle("");
    setEditContent("");
    setEditError("");
  };

  const submitEdit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedPost) return;
    const title = editTitle.trim();
    const content = editContent.trim();
    if (!title || !content) {
      setEditError("제목과 내용을 입력해 주세요.");
      return;
    }

    setIsUpdatingPost(true);
    try {
      const response = await fetch(`/api/posts/${selectedPost.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ boardSlug: selectedPost.boardSlug, title, content }),
      });
      if (!response.ok) throw new Error(await readError(response));
      const updatedPost = await response.json() as BoardPost;
      updatePostInList(updatedPost);
      cancelEdit();
    } catch (caughtError) {
      setEditError(caughtError instanceof Error ? caughtError.message : "게시글을 수정하지 못했습니다.");
    } finally {
      setIsUpdatingPost(false);
    }
  };

  const deleteSelectedPost = async () => {
    if (!selectedPost || !isMyPost(selectedPost) || !window.confirm("이 게시글을 삭제할까요?")) return;
    try {
      const response = await fetch(`/api/posts/${selectedPost.id}`, { method: "DELETE", credentials: "include" });
      if (!response.ok) throw new Error(await readError(response));
      setPosts((currentPosts) => currentPosts.filter((post) => post.id !== selectedPost.id));
      navigateBoard({ mode: "list" }, true);
    } catch (caughtError) {
      setDetailError(caughtError instanceof Error ? caughtError.message : "게시글을 삭제하지 못했습니다.");
    }
  };

  const togglePostLike = async (post: BoardPost) => {
    if (!member) {
      onLogin();
      return;
    }
    if (post.authorId === member.id) {
      window.alert("본인 게시글은 추천할 수 없습니다.");
      return;
    }

    try {
      const response = await fetch(`/api/posts/${post.id}/likes`, { method: "POST", credentials: "include" });
      if (!response.ok) throw new Error(await readError(response));
      const updatedPost = await response.json() as BoardPost;
      updatePostInList(updatedPost);
    } catch (caughtError) {
      window.alert(caughtError instanceof Error ? caughtError.message : "추천을 처리하지 못했습니다.");
    }
  };

  const togglePostDislike = async (post: BoardPost) => {
    if (!member) {
      onLogin();
      return;
    }
    if (post.authorId === member.id) {
      window.alert("본인 게시글은 싫어요할 수 없습니다.");
      return;
    }

    try {
      const response = await fetch(`/api/posts/${post.id}/dislikes`, { method: "POST", credentials: "include" });
      if (!response.ok) throw new Error(await readError(response));
      const updatedPost = await response.json() as BoardPost;
      updatePostInList(updatedPost);
    } catch (caughtError) {
      window.alert(caughtError instanceof Error ? caughtError.message : "싫어요를 처리하지 못했습니다.");
    }
  };

  const togglePostBookmark = async (post: BoardPost) => {
    if (!member) {
      onLogin();
      return;
    }

    try {
      const response = await fetch(`/api/posts/${post.id}/bookmarks`, { method: "POST", credentials: "include" });
      if (!response.ok) throw new Error(await readError(response));
      const updatedPost = await response.json() as BoardPost;
      updatePostInList(updatedPost);
    } catch (caughtError) {
      window.alert(caughtError instanceof Error ? caughtError.message : "즐겨찾기를 처리하지 못했습니다.");
    }
  };

  const submitComment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedPost) return;
    if (!member) {
      onLogin();
      return;
    }

    const content = newComment.trim();
    if (!content) {
      setCommentError("댓글 내용을 입력해 주세요.");
      return;
    }

    setIsSubmittingComment(true);
    setCommentError("");
    try {
      const response = await fetch(`/api/posts/${selectedPost.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content }),
      });
      if (!response.ok) throw new Error(await readError(response));
      const createdComment = await response.json() as BoardComment;
      setComments((currentComments) => [...currentComments, createdComment]);
      setNewComment("");
      setSelectedPost((currentPost) => currentPost ? { ...currentPost, commentCount: (currentPost.commentCount ?? 0) + 1 } : currentPost);
      setPosts((currentPosts) => currentPosts.map((post) => post.id === selectedPost.id ? { ...post, commentCount: (post.commentCount ?? 0) + 1 } : post));
    } catch (caughtError) {
      setCommentError(caughtError instanceof Error ? caughtError.message : "댓글을 등록하지 못했습니다.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const toggleCommentLike = async (commentId: number) => {
    if (!member) {
      onLogin();
      return;
    }

    try {
      const response = await fetch(`/api/comments/${commentId}/likes`, { method: "POST", credentials: "include" });
      if (!response.ok) throw new Error(await readError(response));
      const updatedComment = await response.json() as BoardComment;
      setComments((currentComments) => currentComments.map((comment) => comment.id === updatedComment.id ? updatedComment : comment));
    } catch (caughtError) {
      window.alert(caughtError instanceof Error ? caughtError.message : "댓글 추천을 처리하지 못했습니다.");
    }
  };

  const toggleCommentDislike = async (commentId: number) => {
    if (!member) {
      onLogin();
      return;
    }

    try {
      const response = await fetch(`/api/comments/${commentId}/dislikes`, { method: "POST", credentials: "include" });
      if (!response.ok) throw new Error(await readError(response));
      const updatedComment = await response.json() as BoardComment;
      setComments((currentComments) => currentComments.map((comment) => comment.id === updatedComment.id ? updatedComment : comment));
    } catch (caughtError) {
      window.alert(caughtError instanceof Error ? caughtError.message : "댓글 싫어요를 처리하지 못했습니다.");
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  useEffect(() => {
    const onPopState = () => {
      setBoardRoute(readBoardRoute());
      const params = new URLSearchParams(window.location.search);
      setSearchQuery(params.get("q") ?? "");
      setSearchScope(params.get("scope") ?? "all");
      window.scrollTo(0, 0);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (boardRoute.mode === "list") {
      setIsWriting(false);
      setIsEditing(false);
      setSelectedPost(null);
      setComments([]);
      setDetailError("");
      setWriteError("");
      return;
    }

    if (boardRoute.mode === "write") {
      if (!member) {
        onLogin();
        return;
      }
      setSelectedPost(null);
      setComments([]);
      setIsEditing(false);
      setIsWriting(true);
      setWriteTitle("");
      setWriteContent("");
      setWriteError("");
      return;
    }

    setIsWriting(false);
    setIsEditing(false);
    loadPostDetail(boardRoute.postId);
  }, [boardRoute.mode, boardRoute.mode === "detail" ? boardRoute.postId : 0, member?.id]);

  useEffect(() => {
    setCurrentPage(1);
  }, [pageSize, sortMode, searchQuery, searchScope]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <>
      <Header
        onHome={boardHomeHandler}
        theme={theme}
        onToggleTheme={onToggleTheme}
        member={member}
        onLogin={onLogin}
        onSignup={onSignup}
        onLogout={onLogout}
        onMyPage={onMyPage}
        onMainHome={onHome}
        variant={isLolLoungeBoard ? "lol" : "main"}
        showHomeButton={isLolLoungeBoard}
      />

      <main className="main boardPage">
        <div className="breadcrumbs">
          <button onClick={onHome}>홈</button>
          <span>›</span>
          <span>{boardHeroTitle}</span>
        </div>

        <section className={`boardHero ${isLolLoungeBoard ? "lolBoardHero" : ""} ${isBadmintonLoungeBoard ? "badmintonBoardHero" : ""}`}>
          <div>
            <span className="boardHeroIcon">💬</span>
            <div>
              <span className="eyebrow">{boardHeroEyebrow}</span>
              <h1>{boardHeroTitle}</h1>
              <p>{boardHeroDescription}</p>
            </div>
          </div>
          <button className="writeButton" type="button" onClick={openWriteForm}>✎ 글쓰기</button>
        </section>

        {isWriting ? (
          <>
            <section className="boardTable writePanel" style={{ marginTop: 16 }}>
              <div className="tableTools">
                <b>게시글 작성</b>
                <button type="button" className="sortSelected" onClick={backToList}>목록으로</button>
              </div>

              <form id="free-post-form" className="postWriteForm" onSubmit={submitPost}>
                <label>
                  제목
                  <input
                    value={writeTitle}
                    onChange={(event) => setWriteTitle(event.target.value)}
                    placeholder="제목을 입력해 주세요"
                    maxLength={200}
                    required
                  />
                </label>

                {member && (
                  <p className="writerLine">
                    작성자: <b>{member.nickname}</b>
                  </p>
                )}

                <label>
                  내용
                  <textarea
                    value={writeContent}
                    onChange={(event) => setWriteContent(event.target.value)}
                    placeholder="내용을 입력해 주세요"
                    required
                    rows={12}
                  />
                </label>

                <div className="imageUploadRow">
                  <label className="imageUploadButton">
                    <input type="file" accept="image/*" multiple onChange={(event) => { handleImageUpload(event.target.files); event.target.value = ""; }} disabled={isUploadingImage} />
                    <span aria-hidden="true">🖼</span> {isUploadingImage ? "업로드 중..." : "사진 추가"}
                  </label>
                  <span className="imageUploadHint">이미지를 선택하면 본문에 자동으로 삽입됩니다.</span>
                </div>

                {writeError && <p className="authError" style={{ margin: 0 }}>{writeError}</p>}
              </form>
            </section>
            <div className="writeSubmitBar">
              <button form="free-post-form" className="authSubmit writeSubmitButton" disabled={isSubmittingPost}>
                {isSubmittingPost ? "등록 중..." : "등록"}
              </button>
            </div>
          </>
        ) : isEditing && selectedPost ? (
          <section className="boardTable" style={{ marginTop: 16 }}>
            <div className="tableTools">
              <b>게시글 수정</b>
              <button type="button" className="sortSelected" onClick={cancelEdit}>취소</button>
            </div>
            <form className="postWriteForm" onSubmit={submitEdit}>
              <label>
                제목
                <input value={editTitle} onChange={(event) => setEditTitle(event.target.value)} maxLength={200} required />
              </label>
              <label>
                내용
                <textarea value={editContent} onChange={(event) => setEditContent(event.target.value)} rows={12} required />
              </label>
              {editError && <p className="authError" style={{ margin: 0 }}>{editError}</p>}
              <div className="formActions">
                <button type="button" className="authCancel" onClick={cancelEdit}>취소</button>
                <button className="authSubmit" disabled={isUpdatingPost}>{isUpdatingPost ? "수정 중..." : "수정 완료"}</button>
              </div>
            </form>
          </section>
        ) : boardRoute.mode === "detail" ? (
          <section className="boardTable detailPanel" style={{ marginTop: 16 }}>
            <div className="tableTools">
              <b>게시글 상세</b>
              <button type="button" className="sortSelected" onClick={backToList}>목록으로</button>
            </div>

            {isDetailLoading && !selectedPost && (
              <article className="postRow emptyRow">
                <span>-</span>
                <span>-</span>
                <span className="emptyMessage">게시글을 불러오는 중입니다.</span>
              </article>
            )}

            {detailError && (
              <article className="postRow emptyRow">
                <span>-</span>
                <span>-</span>
                <span className="emptyMessage">{detailError}</span>
              </article>
            )}

            {selectedPost && !detailError && (
              <article className="postDetailArticle">
                <div className="postDetailHeader">
                  <div>
                    <h2>{selectedPost.title}</h2>
                    <p>{selectedPost.authorName} · {formatFullDateTime(selectedPost.createdAt)} · 조회 {selectedPost.viewCount} · 댓글 {selectedPost.commentCount ?? 0}</p>
                  </div>
                  <div className="postDetailActions">
                    <button
                      type="button"
                      className={`detailBookmarkButton bookmarkButton ${selectedPost.bookmarkedByMe ? "active" : ""}`}
                      onClick={() => togglePostBookmark(selectedPost)}
                      aria-label={selectedPost.bookmarkedByMe ? "즐겨찾기 해제" : "즐겨찾기"}
                      title={selectedPost.bookmarkedByMe ? "즐겨찾기 해제" : "즐겨찾기"}
                    >
                      {selectedPost.bookmarkedByMe ? "★" : "☆"}
                    </button>
                    <button
                      type="button"
                      className={`recommendButton ${selectedPost.likedByMe ? "active" : ""}`}
                      onClick={() => togglePostLike(selectedPost)}
                      disabled={isMyPost(selectedPost)}
                      title={isMyPost(selectedPost) ? "본인 게시글은 추천할 수 없습니다." : "게시글 추천"}
                    >
                      👍 추천 {selectedPost.likeCount ?? 0}
                    </button>
                    <button
                      type="button"
                      className={`recommendButton dislikeButton ${selectedPost.dislikedByMe ? "active" : ""}`}
                      onClick={() => togglePostDislike(selectedPost)}
                      disabled={isMyPost(selectedPost)}
                      title={isMyPost(selectedPost) ? "본인 게시글은 싫어요할 수 없습니다." : "게시글 싫어요"}
                    >
                      👎 싫어요 {selectedPost.dislikeCount ?? 0}
                    </button>
                    {isMyPost(selectedPost) && <>
                      <button type="button" className="textButton" onClick={beginEdit}>수정</button>
                      <button type="button" className="textButton" onClick={deleteSelectedPost}>삭제</button>
                    </>}
                    <button type="button" className="textButton" onClick={backToList}>목록</button>
                  </div>
                </div>

                <div className="postDetailContent">{renderPostContent(selectedPost.content)}</div>

                <section className="commentSection">
                  <div className="commentHeader">
                    <h3>댓글 <strong>{comments.length}</strong></h3>
                    <div className="commentSortGroup">
                      {isCommentLoading && <span>불러오는 중...</span>}
                      <button type="button" className={commentSort === "oldest" ? "sortSelected" : ""} onClick={() => setCommentSort("oldest")}>등록순</button>
                      <button type="button" className={commentSort === "latest" ? "sortSelected" : ""} onClick={() => setCommentSort("latest")}>최신순</button>
                    </div>
                  </div>

                  {commentError && <p className="authError commentError">{commentError}</p>}

                  <div className="commentList">
                    {!isCommentLoading && comments.length === 0 && <p className="emptyComment">아직 댓글이 없습니다. 첫 댓글을 남겨보세요.</p>}
                    {sortedComments.map((comment) => (
                      <article className="commentItem" key={comment.id}>
                        <div>
                          <b>{comment.authorName}</b>
                          <span>{formatDate(comment.createdAt)}</span>
                        </div>
                        <p>{comment.content}</p>
                        <div className="commentVoteGroup">
                          <button type="button" className={`commentLikeButton ${comment.likedByMe ? "active" : ""}`} onClick={() => toggleCommentLike(comment.id)}>
                            👍 {comment.likeCount ?? 0}
                          </button>
                          <button type="button" className={`commentLikeButton dislikeButton ${comment.dislikedByMe ? "active" : ""}`} onClick={() => toggleCommentDislike(comment.id)}>
                            👎 {comment.dislikeCount ?? 0}
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>

                  <form className="commentForm" onSubmit={submitComment}>
                    <textarea value={newComment} onChange={(event) => setNewComment(event.target.value)} placeholder={member ? "댓글을 입력해 주세요" : "로그인 후 댓글을 작성할 수 있습니다."} rows={4} />
                    <button className="authSubmit" disabled={isSubmittingComment}>{isSubmittingComment ? "등록 중..." : "댓글 등록"}</button>
                  </form>
                </section>
              </article>
            )}
          </section>
        ) : (
          <div className="boardLayout boardLayoutWide">
            <section className={`boardTable ${isLolLoungeBoard ? "lolBoardTable" : ""} ${isBadmintonLoungeBoard ? "badmintonBoardTable" : ""}`}>
              {searchQuery && (
                <div className="searchResultBar">
                  <span className="searchResultText">
                    <span className="searchResultIcon" aria-hidden="true">⌕</span>
                    <b>'{searchQuery}'</b>
                    <small>{searchScope === "title" ? "제목" : searchScope === "author" ? "글쓴이" : searchScope === "content" ? "글 내용" : "전체"} 검색 결과</small>
                    <strong>{filteredPosts.length}</strong>건
                  </span>
                  <button type="button" className="searchClearButton" onClick={clearSearch}>✕ 검색 해제</button>
                </div>
              )}
              <div className="tableTools boardTableTools">
                <b>전체 글 <strong>{searchQuery ? filteredPosts.length : posts.length}</strong></b>
                <div className="boardListControls">
                  <label>
                    보기
                    <select value={pageSize} onChange={(event) => setPageSize(Number(event.target.value))}>
                      <option value={15}>15개씩</option>
                      <option value={20}>20개씩</option>
                    </select>
                  </label>
                  <button type="button" className={sortMode === "latest" ? "sortSelected" : ""} onClick={() => setSortMode("latest")}>최신순</button>
                  <button type="button" className={sortMode === "likes" ? "sortSelected" : ""} onClick={() => setSortMode("likes")}>추천순</button>
                  <button type="button" className={sortMode === "views" ? "sortSelected" : ""} onClick={() => setSortMode("views")}>조회순</button>
                  <button type="button" className={`refreshButton ${isLoading ? "refreshing" : ""}`} onClick={loadPosts} disabled={isLoading} title="목록 새로고침" aria-label="목록 새로고침"><span className="refreshIcon" aria-hidden="true">↻</span> 새로고침</button>
                </div>
              </div>

              <div className="tableHead">
                <span>즐겨찾기</span>
                <span>번호</span>
                <span>제목</span>
                <span>글쓴이</span>
                <span>작성일</span>
                <span>조회</span>
                <span>추천/싫어요</span>
              </div>

              {isLoading && (
                <article className="postRow emptyRow">
                  <span>-</span>
                  <span>-</span>
                  <span className="emptyMessage">게시글을 불러오는 중입니다.</span>
                </article>
              )}

              {error && (
                <article className="postRow emptyRow">
                  <span>-</span>
                  <span>-</span>
                  <span className="emptyMessage">{error}</span>
                </article>
              )}

              {!isLoading && !error && filteredPosts.length === 0 && (
                <article className="postRow emptyRow">
                  <span>-</span>
                  <span>-</span>
                  <span className="emptyMessage">{searchQuery ? `'${searchQuery}'에 대한 검색 결과가 없습니다.` : "아직 등록된 게시글이 없습니다."}</span>
                </article>
              )}

              {!isLoading && !error && visiblePosts.map((post) => (
                <article className="postRow" key={post.id}>
                  <span>
                    <button
                      type="button"
                      className={`bookmarkButton ${post.bookmarkedByMe ? "active" : ""}`}
                      onClick={() => togglePostBookmark(post)}
                      aria-label={post.bookmarkedByMe ? "즐겨찾기 해제" : "즐겨찾기"}
                      title={post.bookmarkedByMe ? "즐겨찾기 해제" : "즐겨찾기"}
                    >
                      {post.bookmarkedByMe ? "★" : "☆"}
                    </button>
                  </span>
                  <span>{post.id}</span>
                  <button type="button" className="postLink" onClick={() => openPostDetail(post.id)}>
                    {post.title}
                    {(post.commentCount ?? 0) > 0 && <small> [{post.commentCount}]</small>}
                  </button>
                  <span>{post.authorName}</span>
                  <span>{formatDate(post.createdAt)}</span>
                  <span>{post.viewCount}</span>
                  <span className="listVoteCell">
                    <button
                      type="button"
                      className={`miniLikeButton ${post.likedByMe ? "active" : ""}`}
                      onClick={() => togglePostLike(post)}
                      disabled={member?.id === post.authorId}
                      title={member?.id === post.authorId ? "본인 게시글은 추천할 수 없습니다." : "추천"}
                    >
                      👍 {post.likeCount ?? 0}
                    </button>
                    <button
                      type="button"
                      className={`miniLikeButton dislikeButton ${post.dislikedByMe ? "active" : ""}`}
                      onClick={() => togglePostDislike(post)}
                      disabled={member?.id === post.authorId}
                      title={member?.id === post.authorId ? "본인 게시글은 싫어요할 수 없습니다." : "싫어요"}
                    >
                      👎 {post.dislikeCount ?? 0}
                    </button>
                  </span>
                </article>
              ))}

              <div className="pagination">
                <button type="button" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={safeCurrentPage === 1}>‹</button>
                {pageNumbers.map((page) => (
                  <button type="button" key={page} className={page === safeCurrentPage ? "current" : ""} onClick={() => setCurrentPage(page)}>{page}</button>
                ))}
                <button type="button" onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={safeCurrentPage === totalPages}>›</button>
              </div>
            </section>
          </div>
        )}
      </main>
    </>
  );
}

const MEMBER_CACHE_KEY = "lounge-member";

function readView(): View {
  const params = new URLSearchParams(window.location.search);
  if (params.get("board") === "free") return "free";
  const view = params.get("view");
  return view === "login" || view === "signup" || view === "lol" || view === "fifa" || view === "badminton" ? view : "home";
}

function clearCachedMember() {
  localStorage.removeItem(MEMBER_CACHE_KEY);
  sessionStorage.removeItem(MEMBER_CACHE_KEY);
}

function getCachedMember(): Member | null {
  try {
    // "로그인 유지"를 끄면 sessionStorage에만 저장되어 브라우저를 닫으면 사라진다.
    const saved = sessionStorage.getItem(MEMBER_CACHE_KEY) ?? localStorage.getItem(MEMBER_CACHE_KEY);
    if (!saved) return null;
    const parsed: unknown = JSON.parse(saved);
    if (
      !parsed || typeof parsed !== "object" ||
      typeof (parsed as Member).id !== "number" ||
      typeof (parsed as Member).username !== "string" ||
      typeof (parsed as Member).nickname !== "string" ||
      typeof (parsed as Member).email !== "string"
    ) {
      clearCachedMember();
      return null;
    }
    return parsed as Member;
  } catch {
    clearCachedMember();
    return null;
  }
}

async function readError(response: Response) {
  if (response.status === 401) return "로그인이 필요하거나 아이디/비밀번호가 올바르지 않습니다.";
  if (response.status === 409) return "이미 사용 중인 아이디, 닉네임 또는 이메일입니다.";
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const body = await response.json() as { message?: string; detail?: string; errors?: Array<{ defaultMessage?: string }> };
    return body.errors?.[0]?.defaultMessage || body.detail || body.message || (response.status === 400 ? "입력한 정보를 다시 확인해 주세요." : "요청을 처리하지 못했습니다.");
  }
  return (await response.text()) || (response.status === 400 ? "입력한 정보를 다시 확인해 주세요." : "요청을 처리하지 못했습니다.");
}

const categories: Category[] = [
  { id: 1, title: "롤 라운지", icon: "⚔️", color: "#2563eb", description: "리그 오브 레전드" },
  { id: 2, title: "피파 라운지", icon: "⚽", color: "#16a34a", description: "축구 게임 커뮤니티" },
  { id: 3, title: "메이플 라운지", icon: "🍁", color: "#dc2626", description: "메이플스토리" },
  { id: 4, title: "축구 라운지", icon: "🏟️", color: "#ea580c", description: "축구 이야기" },
  { id: 5, title: "농구 라운지", icon: "🏀", color: "#f97316", description: "농구 이야기" },
  { id: 6, title: "배드민턴 라운지", icon: "🏸", color: "#84cc16", description: "배드민턴 이야기" },
];

const defaultRecentSearches = ["롤 패치노트", "메이플 이벤트", "피파 스쿼드", "농구 하이라이트"];
const defaultRealtimeKeywords = ["롤 전적", "메이플 하이퍼버닝", "피파 신규 시즌", "축구 이적시장", "농구 플레이오프", "배드민턴 라켓", "라운지 이벤트", "게임 쿠폰", "자유 게시판", "오늘의 인기글"];

const searchScopeOptions = [
  { value: "all", label: "전체" },
  { value: "title", label: "제목" },
  { value: "content", label: "글 내용" },
  { value: "author", label: "글쓴이" },
];



const homepageHotPosts: HomePost[] = [
  { board: "자유 게시판", title: "오늘 업데이트 이후 체감 어떤가요?", author: "라운저", count: 42, time: "12:48", isHot: true, isNew: true },
  { board: "게임 게시판", title: "이번 주 이벤트 보상 정리해봤습니다", author: "겜잘알", count: 31, time: "12:15", isHot: true, isNew: true },
  { board: "공략 게시판", title: "초보자가 먼저 챙기면 좋은 세팅 모음", author: "공략러", count: 28, time: "11:43", isHot: true, isNew: true },
  { board: "롤 라운지", title: "이번 패치 이후 라인전 느낌이 확 달라졌네요", author: "탑장인", count: 24, time: "11:10", isHot: true },
  { board: "피파 라운지", title: "가성비 스쿼드 맞출 때 은근 좋은 선수들", author: "감독님", count: 21, time: "10:52", isHot: true },
  { board: "메이플 라운지", title: "주간 보스 돌기 전에 챙기면 좋은 것들", author: "단풍러", count: 19, time: "10:28", isHot: true },
];

const homepageRecommendedPosts: HomePost[] = [
  { board: "공략 게시판", title: "자주 묻는 질문 한 번에 보기", author: "관리자", count: 16, time: "어제" },
  { board: "거래 게시판", title: "거래 전 꼭 확인해야 할 체크리스트", author: "안전거래", count: 14, time: "어제" },
  { board: "게임 게시판", title: "이번 시즌 주요 변경점 요약", author: "소식통", count: 12, time: "월요일" },
  { board: "축구 라운지", title: "입문자가 보기 좋은 포지션별 역할 정리", author: "축덕", count: 11, time: "월요일" },
  { board: "농구 라운지", title: "처음 보는 사람도 이해되는 전술 용어 모음", author: "코트위", count: 9, time: "일요일" },
  { board: "배드민턴 라운지", title: "라켓 고를 때 무게보다 먼저 봐야 할 것", author: "셔틀콕", count: 8, time: "일요일" },
];

const hotImagePosts: HotImagePost[] = [
  { tag: "화제글", title: "롤드컵 결승전 명장면 모음", image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=520&q=80" },
  { tag: "이벤트", title: "피파 신규 시즌 쿠폰 정리", image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=520&q=80" },
  { tag: "화제글", title: "메이플 여름 업데이트 미리보기", image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=520&q=80" },
  { tag: "인기", title: "농구 플레이오프 하이라이트", image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=520&q=80" },
];

function PostBadges({ isHot, isNew }: { isHot?: boolean; isNew?: boolean }) {
  return <span className="badgeGroup">{isHot && <span className="hotBadge">H</span>}{isNew && <span className="newBadge">N</span>}</span>;
}

function formatNotificationTime(createdAt: string) {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "";
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "방금 전";
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay}일 전`;
  return date.toLocaleDateString("ko-KR");
}

function NotificationBell({ member }: { member: Member }) {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const loadUnreadCount = () => {
    fetch("/api/notifications/unread-count", { credentials: "include" })
      .then((response) => response.ok ? response.json() as Promise<{ count: number }> : { count: 0 })
      .then((data) => setUnreadCount(data.count ?? 0))
      .catch(() => undefined);
  };

  const loadNotifications = () => {
    setIsLoading(true);
    fetch("/api/notifications", { credentials: "include" })
      .then((response) => response.ok ? response.json() as Promise<NotificationItem[]> : [])
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadUnreadCount();
    const timer = window.setInterval(loadUnreadCount, 30000);
    return () => window.clearInterval(timer);
  }, [member.id]);

  const toggleOpen = () => {
    setIsOpen((current) => {
      const next = !current;
      if (next) loadNotifications();
      return next;
    });
  };

  const goToPost = (item: NotificationItem) => {
    fetch(`/api/notifications/${item.id}/read`, { method: "POST", credentials: "include" }).catch(() => undefined);
    setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, read: true } : entry));
    setUnreadCount((current) => item.read ? current : Math.max(0, current - 1));
    setIsOpen(false);
    if (item.postId) {
      const url = new URL(window.location.href);
      url.search = "";
      url.searchParams.set("board", "free");
      url.searchParams.set("post", String(item.postId));
      window.history.pushState({ view: "free", boardRoute: { mode: "detail", postId: item.postId } }, "", url);
      window.dispatchEvent(new PopStateEvent("popstate"));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const markAllRead = () => {
    fetch("/api/notifications/read-all", { method: "POST", credentials: "include" }).catch(() => undefined);
    setItems((current) => current.map((entry) => ({ ...entry, read: true })));
    setUnreadCount(0);
  };

  return (
    <div className="notificationBell" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsOpen(false); }}>
      <button type="button" className="notificationToggle" aria-label="내 글 소식" title="내 글 소식" onClick={toggleOpen}>
        <span aria-hidden="true">🔔</span>
        {unreadCount > 0 && <span className="notificationBadge">{unreadCount > 99 ? "99+" : unreadCount}</span>}
      </button>
      {isOpen && (
        <section className="notificationPanel" onMouseDown={(event) => event.preventDefault()}>
          <div className="notificationPanelHead">
            <b>내 글 소식</b>
            <button type="button" onClick={markAllRead} disabled={items.every((entry) => entry.read)}>모두 확인</button>
          </div>
          <div className="notificationList">
            {isLoading && <p className="notificationEmpty">불러오는 중...</p>}
            {!isLoading && items.length === 0 && <p className="notificationEmpty">아직 내 글에 달린 댓글이나 추천이 없습니다.</p>}
            {!isLoading && items.map((item) => (
              <button
                type="button"
                key={item.id}
                className={`notificationItem ${item.read ? "" : "unread"}`}
                onClick={() => goToPost(item)}
              >
                <span className="notificationIcon" aria-hidden="true">{item.type === "POST_LIKE" ? "👍" : "💬"}</span>
                <span className="notificationBody">
                  <span className="notificationText">{item.message}</span>
                  <small>{formatNotificationTime(item.createdAt)}</small>
                </span>
                {!item.read && <span className="notificationDot" aria-hidden="true" />}
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Header({ onHome, theme, onToggleTheme, member, onLogin, onSignup, onLogout, onMyPage = onHome, variant = "main", showHomeButton = false, onMainHome }: { onHome: () => void; theme: Theme; onToggleTheme: () => void; member: Member | null; onLogin: () => void; onSignup: () => void; onLogout: () => void; onMyPage?: () => void; variant?: "main" | "lol" | "fifa" | "badminton"; showHomeButton?: boolean; onMainHome?: () => void }) {
  const [keyword, setKeyword] = useState(() => new URLSearchParams(window.location.search).get("q") ?? "");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("recentSearches");
      if (!saved) return defaultRecentSearches;
      const parsed: unknown = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.every((item) => typeof item === "string")
        ? parsed.slice(0, 6)
        : defaultRecentSearches;
    } catch {
      localStorage.removeItem("recentSearches");
      return defaultRecentSearches;
    }
  });
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchScope, setSearchScope] = useState("all");
  const [showRecentSearches, setShowRecentSearches] = useState(() => localStorage.getItem("hideRecentSearches") !== "true");

  useEffect(() => {
    localStorage.setItem("recentSearches", JSON.stringify(recentSearches));
  }, [recentSearches]);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("q")) {
      const input = searchInputRef.current;
      if (input) {
        input.focus();
        input.select();
      }
    }
    // 페이지 진입 시 검색어가 있으면 입력칸의 텍스트를 드래그된 상태처럼 선택해 둔다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitSearch = () => {
    const nextKeyword = keyword.trim();
    if (!nextKeyword) return;
    setRecentSearches((current) => [nextKeyword, ...current.filter((item) => item !== nextKeyword)].slice(0, 6));

    // 자유 게시판으로 이동하면서 검색어를 전달한다.
    const url = new URL(window.location.href);
    url.search = "";
    url.searchParams.set("board", "free");
    url.searchParams.set("q", nextKeyword);
    if (searchScope !== "all") url.searchParams.set("scope", searchScope);
    window.history.pushState({ view: "free" }, "", url);
    window.dispatchEvent(new PopStateEvent("popstate"));
    window.scrollTo({ top: 0, behavior: "smooth" });

    // 방금 친 검색어를 자연스럽게 블록(드래그) 선택 상태로 둔다.
    window.requestAnimationFrame(() => searchInputRef.current?.select());

    // 실시간 검색어 집계용 기록 (실패해도 검색 자체는 진행)
    fetch("/api/search-keywords", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ keyword: nextKeyword }),
    })
      .then((response) => {
        if (response.ok) window.dispatchEvent(new CustomEvent("searchKeywordRecorded", { detail: nextKeyword }));
      })
      .catch(() => undefined);
  };

  const hideRecent = () => {
    setShowRecentSearches(false);
    localStorage.setItem("hideRecentSearches", "true");
  };

  const removeRecent = (target: string) => {
    setRecentSearches((current) => current.filter((item) => item !== target));
  };

  const isLolHeader = variant === "lol";
  const isFifaHeader = variant === "fifa";
  const isBadmintonHeader = variant === "badminton";
  const isLoungeHeader = isLolHeader || isFifaHeader || isBadmintonHeader;
  const loungeTitle = isFifaHeader ? "FCO LOUNGE" : isBadmintonHeader ? "BMTON LOUNGE" : "LOL LOUNGE";
  const loungeSubtitle = isFifaHeader ? "FC ONLINE" : isBadmintonHeader ? "SHUTTLE & COURT" : "LEAGUE OF LEGENDS";
  const loungeMark = isFifaHeader ? "F" : isBadmintonHeader ? "B" : "L";

  return <header className={`header ${isLolHeader ? "lolHeader" : ""} ${isFifaHeader ? "fifaHeader" : ""} ${isBadmintonHeader ? "badmintonHeader" : ""}`}><button className="logo logoButton" onClick={onHome}>{isLoungeHeader ? <><span className="brandLogo logoBox lolLogoMark">{loungeMark}</span><span className="logoText"><span>{loungeTitle}</span><small>{loungeSubtitle}</small></span></> : <><img className="brandLogo" src="/brand/lounge-logo.png" alt="" /><span>LOUNGE</span><small>COMMUNITY</small></>}</button><div className="searchArea"><form className={`searchBox ${isSearchFocused ? "searchBoxFocused" : ""}`} onFocus={() => setIsSearchFocused(true)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsSearchFocused(false); }} onSubmit={(event) => { event.preventDefault(); submitSearch(); }}>{isSearchFocused && <div className="searchScopeTabs" role="group" aria-label="검색 범위">{searchScopeOptions.map((option) => <button key={option.value} type="button" className={searchScope === option.value ? "active" : ""} onClick={() => setSearchScope(option.value)}>{option.label}</button>)}</div>}<input ref={searchInputRef} type="search" aria-label="게시판 검색" placeholder={isSearchFocused ? "" : "게시판, 글, 유저를 검색해보세요"} value={keyword} onChange={(event) => setKeyword(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); submitSearch(); } }} /><button aria-label="검색">⌕</button></form>{isSearchFocused && <section className={`recentSearches ${showRecentSearches ? "" : "recentSearchesFolded"}`} onMouseDown={(event) => event.preventDefault()}>{showRecentSearches ? <><div className="recentTitle"><b>최근 검색어</b><button onClick={() => setRecentSearches([])}>전체 삭제</button></div>{recentSearches.length > 0 ? <ul>{recentSearches.map((item) => <li key={item}><button className="recentKeyword" onClick={() => setKeyword(item)}>{item}</button><button className="recentDeleteButton" aria-label={`${item} 삭제`} onClick={() => removeRecent(item)}>×</button></li>)}</ul> : <p className="recentEmpty">최근 검색어가 없습니다.</p>}<button className="recentOffButton" onClick={hideRecent}>최근 검색어 보기 끄기</button></> : <div className="recentFolded"><span>최근 검색어 보기가 꺼져 있습니다.</span><button onClick={() => { setRecentSearches([]); setShowRecentSearches(true); localStorage.removeItem("hideRecentSearches"); }}>최근 검색어 보기</button></div>}</section>}</div><button className="menuToggle" type="button" aria-label="메뉴 열기" onClick={() => setIsMenuOpen((current) => !current)}>☰</button><div className={`userActions ${isMenuOpen ? "open" : ""}`}>{showHomeButton && <button className="homeIconBtn" type="button" aria-label="메인 라운지로 돌아가기" onClick={onMainHome ?? onHome}>⌂</button>}<button className="themeToggle" type="button" aria-label={theme === "dark" ? "라이트 모드로 변경" : "다크 모드로 변경"} onClick={onToggleTheme}>{theme === "dark" ? "☀" : "☾"}</button>{member && <NotificationBell member={member} />}{member ? <><span className="memberGreeting"><b>{member.nickname}</b>님</span><button className="myPageBtn" onClick={onMyPage}>마이페이지</button><button className="loginBtn" onClick={onLogout}>로그아웃</button></> : <><button className="loginBtn" onClick={onLogin}>로그인</button><button className="joinBtn" onClick={onSignup}>회원가입</button></>}</div></header>;
}


function Home({ onOpenLounge, onOpenLolLounge, theme, onToggleTheme, member, onLogin, onSignup, onLogout, onMyPage = onLogin }: { onOpenLounge: (category: Category) => void; onOpenLolLounge: () => void; theme: Theme; onToggleTheme: () => void; member: Member | null; onLogin: () => void; onSignup: () => void; onLogout: () => void; onMyPage?: () => void }) {
  const latestPosts = [...homepageHotPosts, ...homepageRecommendedPosts.slice(0, 2)].map((post) => ({ ...post, isNew: true }));
  const [realtimeKeywords, setRealtimeKeywords] = useState<string[]>(defaultRealtimeKeywords);
  const [isRealtimeLoading, setIsRealtimeLoading] = useState(true);

  const loadRealtimeKeywords = () => {
    setIsRealtimeLoading(true);
    fetch("/api/search-keywords/realtime", { credentials: "include" })
      .then(async (response) => {
        if (!response.ok) throw new Error("실시간 검색어를 불러오지 못했습니다.");
        return await response.json() as RealtimeKeyword[];
      })
      .then((items) => {
        const keywords = items.map((item) => item.keyword).filter(Boolean);
        setRealtimeKeywords(keywords.length > 0 ? keywords : defaultRealtimeKeywords);
      })
      .catch(() => setRealtimeKeywords(defaultRealtimeKeywords))
      .finally(() => setIsRealtimeLoading(false));
  };

  useEffect(() => {
    loadRealtimeKeywords();
    const refreshRealtimeKeywords = () => loadRealtimeKeywords();
    window.addEventListener("searchKeywordRecorded", refreshRealtimeKeywords);
    return () => window.removeEventListener("searchKeywordRecorded", refreshRealtimeKeywords);
  }, []);

  return (
    <>
      <Header onHome={() => window.scrollTo({ top: 0, behavior: "smooth" })} theme={theme} onToggleTheme={onToggleTheme} member={member} onLogin={onLogin} onSignup={onSignup} onLogout={onLogout} onMyPage={onMyPage} />
      <main className="main" id="home">
        <div className="directoryLayout">
          <section className="categorySection" aria-labelledby="category-title">
            <div className="sectionHeading">
              <div>
                <span className="eyebrow">BOARD DIRECTORY</span>
                <h2 id="category-title">모든 라운지</h2>
              </div>
              <span>관심 있는 커뮤니티를 찾아보세요</span>
            </div>
            <div className="categoryGrid">
              {categories.map((category) => (
                <button className="categoryCard" key={category.id} style={{ "--point-color": category.color } as CSSProperties} onClick={() => onOpenLounge(category)}>
                  <span className="categoryIcon">{category.icon}</span>
                  <span>
                    <b>{category.title}</b>
                    <small>{category.id === 1 || category.id === 2 || category.id === 6 ? category.description : `${category.description} · 준비 중`}</small>
                  </span>
                  <i>{category.id === 1 || category.id === 2 ? "↗" : "·"}</i>
                </button>
              ))}
            </div>
          </section>
          <aside className="realtimePanel">
            <div className="panelHeading">
              <div>
                <h2>실시간 검색어</h2>
                <p>{isRealtimeLoading ? "검색어 집계 중" : "지금 많이 찾는 키워드"}</p>
              </div>
            </div>
            <ol>
              {realtimeKeywords.map((keyword, index) => <li key={keyword}><b>{index + 1}</b><span>{keyword}</span></li>)}
            </ol>
          </aside>
        </div>

        <div className="hotMediaLayout">
          <section className="boardPanel hotImagePanel">
            <div className="panelHeading">
              <div>
                <h2>사진 인기글</h2>
                <p>이미지가 있는 핫 게시물</p>
              </div>
              <button className="textButton">새로고침</button>
            </div>
            <div className="hotImageGrid">
              {hotImagePosts.map((post) => (
                <button className="hotImageCard" key={post.title} style={{ backgroundImage: `url(${post.image})` }}>
                  <span>{post.tag}</span>
                  <b>{post.title}</b>
                </button>
              ))}
            </div>
          </section>

          <section className="boardPanel hotPanel">
            <div className="panelHeading">
              <div>
                <span className="headingBadge hotBadge">H</span>
                <h2>핫 게시판</h2>
                <p>지금 가장 활발한 이야기</p>
              </div>
              <button className="textButton" onClick={onOpenLolLounge}>더보기 →</button>
            </div>
            <ul className="postList hotPostList">
              {homepageHotPosts.map((post) => (
                <li key={post.title}>
                  <span className="boardName">{post.board}</span>
                  <button className="postLink" onClick={post.board === "자유 게시판" ? onOpenLolLounge : undefined}>{post.title}</button>
                  <span className="postMeta badgeMeta"><PostBadges isHot={post.isHot} isNew={post.isNew} />{post.author} · <b>{post.count}</b> · {post.time}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="lowerBoards">
          <section className="boardPanel latestPanel">
            <div className="panelHeading">
              <div>
                <span className="headingBadge newBadge">N</span>
                <h2 className="latestTitle"><span>새로운</span><span>게시글</span></h2>
                <p>방금 올라온 커뮤니티 이야기</p>
              </div>
              <div className="tabs"><button className="selected">전체</button><button>자유</button><button>질문</button><button>정보</button></div>
            </div>
            <ul className="postList latestPostList">
              {latestPosts.map((post) => (
                <li key={`latest-${post.title}`}>
                  <span className="boardName">{post.board}</span>
                  <span className="postLink">{post.title}</span>
                  <span className="postMeta badgeMeta"><PostBadges isHot={post.isHot} isNew={post.isNew} />{post.author} · <b>{post.count}</b> · {post.time}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="boardPanel recommendedPanel">
            <div className="panelHeading">
              <div>
                <h2>추천 게시판</h2>
                <p>놓치기 아쉬운 글</p>
              </div>
              <span>더보기 →</span>
            </div>
            <ul className="postList">
              {homepageRecommendedPosts.map((post) => <li key={post.title}><span className="boardName">{post.board}</span><span className="postLink">{post.title}</span><span className="postMeta">{post.author} · <b>{post.count}</b> · {post.time}</span></li>)}
            </ul>
          </section>
        </div>
      </main>
    </>
  );
}

function EnhancedAuthPage({ mode, theme, onToggleTheme, onHome, onModeChange, onSuccess, onToast }: { mode: "login" | "signup"; theme: Theme; onToggleTheme: () => void; onHome: () => void; onModeChange: (mode: View) => void; onSuccess: (member: Member) => void; onToast: (message: string) => void }) {
  const isSignup = mode === "signup";
  const [username, setUsername] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [saveId, setSaveId] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [findUsername, setFindUsername] = useState("");
  const [findEmail, setFindEmail] = useState("");
  const [findError, setFindError] = useState("");
  const [findMessage, setFindMessage] = useState("");
  const [isFinding, setIsFinding] = useState(false);

  useEffect(() => {
    setNickname("");
    setEmail("");
    setEmailError("");
    setPassword("");
    setPasswordConfirm("");
    setShowPassword(false);
    setShowSignupPassword(false);
    setShowPasswordConfirm(false);
    setError("");
    setForgotMode(false);
    setFindUsername("");
    setFindEmail("");
    setFindError("");
    setFindMessage("");

    if (mode === "login") {
      const savedId = localStorage.getItem("lounge-saved-id");
      setUsername(savedId ?? "");
      setSaveId(Boolean(savedId));
      setRememberMe(localStorage.getItem("lounge-remember") === "true");
    } else {
      setUsername("");
    }
  }, [mode]);

  const validateEmail = (value: string) => {
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    setEmailError(valid ? "" : "정확한 형식으로 이메일을 입력하세요.");
    return valid;
  };

  const submitAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!/^[a-zA-Z0-9]{7,30}$/.test(username)) {
      setError("아이디는 영문과 숫자 7~30자로 입력해 주세요.");
      return;
    }
    if (isSignup && (!nickname.trim() || nickname.trim().length < 2 || nickname.trim().length > 30)) {
      setError("닉네임은 2~30자로 입력해 주세요.");
      return;
    }
    if (isSignup && !validateEmail(email)) return;
    if (password.length < 8 || password.length > 72) {
      setError("비밀번호는 8~72자로 입력해 주세요.");
      return;
    }
    if (isSignup && password !== passwordConfirm) {
      setError("비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/auth/${isSignup ? "signup" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(isSignup ? { username, password, nickname: nickname.trim(), email: email.trim() } : { username, password, rememberMe }),
      });
      if (!response.ok) throw new Error(await readError(response));
      const loggedIn = await response.json() as Member;
      if (isSignup) {
        onToast("회원가입이 되었습니다.");
        onModeChange("login");
        return;
      }
      if (saveId) localStorage.setItem("lounge-saved-id", username);
      else localStorage.removeItem("lounge-saved-id");
      localStorage.setItem("lounge-remember", rememberMe ? "true" : "false");
      onSuccess(loggedIn);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "잠시 후 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitPasswordFind = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFindError("");
    setFindMessage("");

    if (!/^[a-zA-Z0-9]{7,30}$/.test(findUsername)) {
      setFindError("아이디는 영문과 숫자 7~30자로 입력해 주세요.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(findEmail)) {
      setFindError("정확한 형식으로 이메일을 입력하세요.");
      return;
    }

    setIsFinding(true);
    try {
      const response = await fetch("/api/auth/password/find", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username: findUsername.trim(), email: findEmail.trim() }),
      });
      if (!response.ok) throw new Error(await readError(response));
      const body = await response.json() as { message?: string };
      setFindMessage(body.message || "비밀번호를 재설정할 수 있는 링크를 이메일로 보냈습니다.");
    } catch (caughtError) {
      setFindError(caughtError instanceof Error ? caughtError.message : "잠시 후 다시 시도해 주세요.");
    } finally {
      setIsFinding(false);
    }
  };

  const passwordField = (value: string, setValue: (value: string) => void, visible: boolean, setVisible: (visible: boolean) => void, placeholder: string, label: string) => (
    <span className="passwordInput">
      <input type={visible ? "text" : "password"} value={value} onChange={(event) => setValue(event.target.value)} placeholder={placeholder} autoComplete="new-password" required minLength={8} maxLength={72} />
      <button type="button" className="passwordToggle" onClick={() => setVisible(!visible)} aria-label={visible ? `${label} 숨기기` : `${label} 보기`}>◉</button>
    </span>
  );

  return <>
    <Header onHome={onHome} theme={theme} onToggleTheme={onToggleTheme} member={null} onLogin={() => onModeChange("login")} onSignup={() => onModeChange("signup")} onLogout={() => undefined} />
    <main className="authMain"><section className="authCard">
      <img className="authLogo" src="/brand/lounge-logo.png" alt="LOUNGE" />
      <span className="eyebrow">{isSignup ? "CREATE ACCOUNT" : "WELCOME BACK"}</span>
      <h1>{isSignup ? "회원가입" : "로그인"}</h1>
      <p>{!isSignup && forgotMode ? "가입 시 등록한 아이디와 이메일을 입력하세요." : isSignup ? "라운지 커뮤니티에서 사용할 계정을 만들어보세요." : "계정으로 로그인하고 커뮤니티를 이어가세요."}</p>
      {!isSignup && forgotMode ? (
        <>
          <form className="authForm" onSubmit={submitPasswordFind}>
            <label>아이디<input value={findUsername} onChange={(event) => setFindUsername(event.target.value)} placeholder="가입한 아이디" autoComplete="username" required minLength={7} maxLength={30} /></label>
            <label>이메일<input type="email" value={findEmail} onChange={(event) => setFindEmail(event.target.value)} placeholder="가입한 이메일" autoComplete="email" required maxLength={254} /></label>
            {findError && <p className="authError">{findError}</p>}
            {findMessage && <p className="findSuccess">📧 {findMessage}</p>}
            <button className="authSubmit" disabled={isFinding}>{isFinding ? "확인 중..." : "비밀번호 재설정 메일 보내기"}</button>
          </form>
          <p className="authSwitch"><button onClick={() => { setForgotMode(false); setFindError(""); setFindMessage(""); }}>← 로그인으로 돌아가기</button></p>
        </>
      ) : (
      <form className="authForm" onSubmit={submitAuth}>
        {isSignup && <>
          <label>닉네임<input value={nickname} onChange={(event) => setNickname(event.target.value)} placeholder="커뮤니티 닉네임" autoComplete="nickname" required minLength={2} maxLength={30} /></label>
          <label>이메일<input type="email" value={email} onChange={(event) => { setEmail(event.target.value); if (emailError) validateEmail(event.target.value); }} onBlur={(event) => validateEmail(event.target.value)} onInvalid={(event) => event.currentTarget.setCustomValidity("정확한 형식으로 이메일을 입력하세요.")} onInput={(event) => event.currentTarget.setCustomValidity("")} placeholder="email@example.com" autoComplete="email" required maxLength={254} />{emailError && <span className="fieldError">{emailError}</span>}</label>
        </>}
        <label>아이디<input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="영문, 숫자 7자 이상" autoComplete="username" required minLength={7} maxLength={30} pattern="[A-Za-z0-9]{7,30}" title="아이디는 영문과 숫자 7~30자로 입력해 주세요." /><small>영문과 숫자만 사용해 7~30자로 입력해 주세요.</small></label>
        <label>비밀번호{isSignup ? passwordField(password, setPassword, showSignupPassword, setShowSignupPassword, "8자 이상 입력하세요", "비밀번호") : <span className="passwordInput"><input type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="8자 이상 입력하세요" autoComplete="current-password" required minLength={8} maxLength={72} /><button type="button" className="passwordToggle" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}>◉</button></span>}<small>8~72자로 입력해 주세요.</small></label>
        {isSignup && <label>비밀번호 확인{passwordField(passwordConfirm, setPasswordConfirm, showPasswordConfirm, setShowPasswordConfirm, "비밀번호를 한 번 더 입력하세요", "비밀번호 확인")}</label>}
        {!isSignup && (
          <div className="authOptions">
            <label className="authCheck"><input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} /> 로그인 유지</label>
            <label className="authCheck"><input type="checkbox" checked={saveId} onChange={(event) => setSaveId(event.target.checked)} /> 아이디 저장</label>
            <button type="button" className="forgotLink" onClick={() => { setForgotMode(true); setError(""); }}>비밀번호 찾기</button>
          </div>
        )}
        {error && <p className="authError">{error}</p>}
        {isSignup ? <div className="authActions"><button type="button" className="authCancel" onClick={onHome}>취소</button><button className="authSubmit" disabled={isSubmitting}>{isSubmitting ? "처리 중..." : "가입하기"}</button></div> : <button className="authSubmit" disabled={isSubmitting}>{isSubmitting ? "처리 중..." : "로그인"}</button>}
      </form>
      )}
      {!(!isSignup && forgotMode) && <p className="authSwitch">{isSignup ? "이미 계정이 있나요?" : "아직 계정이 없나요?"} <button onClick={() => onModeChange(isSignup ? "login" : "signup")}>{isSignup ? "로그인" : "회원가입"}</button></p>}
    </section></main>
  </>;
}

function LolLounge({ header, onOpenFreeBoard }: { header: ReactNode; onOpenFreeBoard: () => void }) {
  return <>{header}<main className="main lolLounge"><section className="lolHero"><div><span className="eyebrow">LOL LOUNGE</span><h1>롤 라운지</h1><p>리그 오브 레전드 이야기를 위한 별도 라운지입니다.</p></div></section><section className="lolQuickGrid"><button type="button" className="lolBoardCard" onClick={onOpenFreeBoard}><b>자유게시판</b><span>롤 라운지의 자유게시판에서 자유롭게 이야기를 나눠보세요.</span></button><article><b>회원가입</b><span>처음 방문했다면 계정을 만들고 참여하세요.</span></article><article><b>마이페이지</b><span>로그인 후 내 정보와 설정을 확인할 수 있습니다.</span></article><article><b>다크모드</b><span>헤더의 테마 버튼으로 화면 분위기를 바꿀 수 있습니다.</span></article></section></main></>;
}

function FifaLounge({ header }: { header: ReactNode }) {
  return <>{header}<main className="main lolLounge fifaLounge"><section className="lolHero fifaHero"><div><span className="eyebrow">FCO LOUNGE</span><h1>피파 라운지</h1><p>스쿼드, 전술, 선수 추천을 이야기하는 축구 게임 라운지입니다.</p></div></section><section className="lolQuickGrid fifaQuickGrid"><article><b>로그인</b><span>상단 버튼으로 계정에 로그인할 수 있습니다.</span></article><article><b>회원가입</b><span>처음 방문했다면 계정을 만들고 참여하세요.</span></article><article><b>마이페이지</b><span>로그인 후 내 정보와 활동을 확인할 수 있습니다.</span></article><article><b>다크모드</b><span>헤더의 테마 버튼으로 화면 분위기를 바꿀 수 있습니다.</span></article></section></main></>;
}
function BadmintonLounge({ header, onOpenFreeBoard }: { header: ReactNode; onOpenFreeBoard: () => void }) {
  return <>{header}<main className="main lolLounge badmintonLounge"><section className="lolHero badmintonHero"><div><span className="eyebrow">BADMINTON LOUNGE</span><h1>배드민턴 라운지</h1><p>라켓, 셔틀콕, 코트 위의 순간을 가볍고 빠르게 나누는 공간입니다.</p></div></section><section className="lolQuickGrid badmintonQuickGrid"><button type="button" className="lolBoardCard badmintonBoardCard" onClick={onOpenFreeBoard}><b>자유게시판</b><span>배드민턴 이야기, 경기 후기, 궁금한 점을 자유롭게 나눠보세요.</span></button><article><b>장비 추천</b><span>라켓, 스트링, 신발, 셔틀콕 정보를 한눈에 공유해요.</span></article><article><b>모임 / 매칭</b><span>동호회 모집과 함께 칠 사람을 찾는 공간입니다.</span></article><article><b>기술 / 레슨</b><span>스매시, 드롭, 풋워크 등 실전 팁을 모아보세요.</span></article></section></main></>;
}
function MyPageModal({ member, onClose }: { member: Member; onClose: () => void }) {
  const [activity, setActivity] = useState<MyPageActivity | null>(null);
  const [activityError, setActivityError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/members/me/activity", { credentials: "include" })
      .then(async (response) => {
        if (!response.ok) throw new Error(await readError(response));
        return await response.json() as MyPageActivity;
      })
      .then((nextActivity) => { if (active) setActivity(nextActivity); })
      .catch((caughtError) => {
        if (active) setActivityError(caughtError instanceof Error ? caughtError.message : "마이페이지 정보를 불러오지 못했습니다.");
      });
    return () => { active = false; };
  }, []);

  const renderPostList = (posts: BoardPost[], emptyText: string) => (
    <ul className="myPostMiniList">
      {posts.length === 0 && <li className="emptyMyPost">{emptyText}</li>}
      {posts.map((post) => (
        <li key={post.id}>
          <span>{post.boardName}</span>
          <b>{post.title}</b>
          <small>{formatBoardTime(post.createdAt)} · 댓글 {post.commentCount ?? 0} · 추천 {post.likeCount ?? 0}</small>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="modalOverlay" role="presentation" onMouseDown={onClose}>
      <section className="myPageModal" role="dialog" aria-modal="true" aria-labelledby="my-page-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modalHeader">
          <div>
            <span className="eyebrow">MY LOUNGE</span>
            <h1 id="my-page-title">마이페이지</h1>
          </div>
          <button className="modalClose" type="button" aria-label="마이페이지 닫기" onClick={onClose}>×</button>
        </div>
        <section className="myPageGrid myPageGridSingle">
          <section className="myProfileCard">
            <div className="profileBadge">{member.nickname.slice(0, 1)}</div>
            <div><span className="eyebrow">MY LOUNGE</span><h1>{member.nickname}님의 라운지</h1><p>{member.username} · {member.email || "이메일 없음"}</p></div>
          </section>
        </section>
        <section className="myActivity"><h2>활동 요약</h2><div><strong>{activity?.postCount ?? 0}</strong><span>내가 쓴 게시글</span></div><div><strong>{activity?.receivedCommentCount ?? 0}</strong><span>받은 댓글</span></div><div><strong>{activity?.favoriteCount ?? 0}</strong><span>즐겨찾기</span></div></section>
        {activityError && <p className="authError myPageError">{activityError}</p>}
        <section className="myActivityBoards">
          <article><div className="panelHeading"><div><h2>내가 쓴 게시글</h2><p>최근 작성한 글</p></div></div>{activity ? renderPostList(activity.myPosts, "아직 작성한 게시글이 없습니다.") : <p className="emptyMyPost">불러오는 중...</p>}</article>
          <article><div className="panelHeading"><div><h2>즐겨찾기</h2><p>별표한 게시글</p></div></div>{activity ? renderPostList(activity.favoritePosts, "아직 즐겨찾기한 게시글이 없습니다.") : <p className="emptyMyPost">불러오는 중...</p>}</article>
        </section>
      </section>
    </div>
  );
}

function ScrollQuickButtons() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const scrollToBottom = () => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });

  return (
    <div className="scrollQuickButtons" aria-label="페이지 빠른 이동">
      <button type="button" onClick={scrollToTop} aria-label="맨 위로 이동">↑</button>
      <button type="button" onClick={scrollToBottom} aria-label="맨 아래로 이동">↓</button>
    </div>
  );
}

function EnhancedApp() {
  const [activeView, setActiveView] = useState<View>(readView);
  const [member, setMember] = useState<Member | null>(getCachedMember);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [authReturnView, setAuthReturnView] = useState<View>("home");
  const [isMyPageOpen, setIsMyPageOpen] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light" || savedTheme === "dark") return savedTheme;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  const updateMember = (next: Member | null) => {
    setMember(next);
    if (!next) {
      clearCachedMember();
      return;
    }
    const value = JSON.stringify(next);
    if (localStorage.getItem("lounge-remember") === "true") {
      localStorage.setItem(MEMBER_CACHE_KEY, value);
      sessionStorage.removeItem(MEMBER_CACHE_KEY);
    } else {
      sessionStorage.setItem(MEMBER_CACHE_KEY, value);
      localStorage.removeItem(MEMBER_CACHE_KEY);
    }
  };

  const notify = (message: string) => {
    const id = Date.now();
    setToast({ id, text: message });
    window.setTimeout(() => {
      setToast((current) => current?.id === id ? null : current);
    }, 2600);
  };

  const navigate = (nextView: View, replace = false) => {
    const url = new URL(window.location.href);
    url.search = "";
    if (nextView === "free") url.searchParams.set("board", "free");
    if (nextView === "login" || nextView === "signup" || nextView === "lol" || nextView === "fifa" || nextView === "badminton") url.searchParams.set("view", nextView);
    window.history[replace ? "replaceState" : "pushState"]({ view: nextView }, "", url);
    setActiveView(nextView);
    window.scrollTo(0, 0);
  };

  const toggleTheme = () => setTheme((current) => current === "dark" ? "light" : "dark");
  const openFreeBoard = () => navigate("free");
  const openLolFreeBoard = () => {
    const url = new URL(window.location.href);
    url.search = "";
    url.searchParams.set("board", "free");
    url.searchParams.set("lounge", "lol");
    window.history.pushState({ view: "free", lounge: "lol" }, "", url);
    setActiveView("free");
    window.scrollTo(0, 0);
  };
  const openBadmintonFreeBoard = () => {
    const url = new URL(window.location.href);
    url.search = "";
    url.searchParams.set("board", "free");
    url.searchParams.set("lounge", "badminton");
    window.history.pushState({ view: "free", lounge: "badminton" }, "", url);
    setActiveView("free");
    window.scrollTo(0, 0);
  };
  const openLounge = (category: Category) => {
    if (category.id === 1) {
      window.open(`${window.location.pathname}?view=lol`, "_blank", "noopener,noreferrer");
    }
    if (category.id === 2) {
      window.open(`${window.location.pathname}?view=fifa`, "_blank", "noopener,noreferrer");
    }
    if (category.id === 6) {
      window.open(`${window.location.pathname}?view=badminton`, "_blank", "noopener,noreferrer");
    }
  };

  const getAuthReturnView = () => activeView === "lol" || activeView === "fifa" || activeView === "badminton" ? activeView : activeView === "free" ? "free" : "home";

  const goLogin = () => {
    setAuthReturnView(getAuthReturnView());
    navigate("login");
  };

  const goSignup = () => {
    setAuthReturnView(getAuthReturnView());
    navigate("signup");
  };

  const openMyPage = () => {
    if (!member) {
      goLogin();
      return;
    }
    setIsMyPageOpen(true);
  };

  const logout = async () => {
    const nextView = activeView === "lol" || activeView === "fifa" || activeView === "badminton" ? activeView : "home";
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" }).catch(() => undefined);
    updateMember(null);
    setIsMyPageOpen(false);
    navigate(nextView, true);
  };

  useEffect(() => {
    const pageTitle = activeView === "lol" ? "LOL LOUNGE" : activeView === "fifa" ? "FCO LOUNGE" : activeView === "badminton" ? "BADMINTON LOUNGE" : activeView === "login" ? "로그인" : activeView === "signup" ? "회원가입" : "LOUNGE";
    document.title = pageTitle;
  }, [activeView]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const onPopState = () => {
      setActiveView(readView());
      window.scrollTo(0, 0);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/me", { credentials: "include" })
      .then(async (response) => response.ok ? await response.json() as Member : null)
      .then((currentMember) => {
        if (!active) return;
        updateMember(currentMember);
        if (currentMember && (readView() === "login" || readView() === "signup")) navigate("home", true);
      })
      .catch(() => undefined)
      .then(() => { if (active) setSessionChecked(true); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (sessionChecked && activeView === "mypage" && !member) goLogin();
  }, [activeView, member, sessionChecked]);

  useEffect(() => {
    if (member && (activeView === "login" || activeView === "signup")) {
      navigate(authReturnView === "login" || authReturnView === "signup" ? "home" : authReturnView, true);
    }
  }, [activeView, member?.id]);

  const isLolView = activeView === "lol";
  const isFifaView = activeView === "fifa";
  const isBadmintonView = activeView === "badminton";
  const isSeparateLoungeView = isLolView || isFifaView || isBadmintonView;
  const headerVariant = isLolView ? "lol" : isFifaView ? "fifa" : isBadmintonView ? "badminton" : "main";
  const header = <Header onHome={() => navigate(isSeparateLoungeView ? activeView : "home")} theme={theme} onToggleTheme={toggleTheme} member={member} onLogin={goLogin} onSignup={goSignup} onLogout={logout} onMyPage={openMyPage} onMainHome={() => navigate("home")} variant={headerVariant} showHomeButton={isSeparateLoungeView} />;

  return <div className="app">{activeView === "lol" && <LolLounge header={header} onOpenFreeBoard={openLolFreeBoard} />}{activeView === "fifa" && <FifaLounge header={header} />}{activeView === "badminton" && <BadmintonLounge header={header} onOpenFreeBoard={openBadmintonFreeBoard} />}{activeView === "free" && <FreeBoard onHome={() => navigate("home")} onLolHome={() => navigate("lol")} onBadmintonHome={() => navigate("badminton")} theme={theme} onToggleTheme={toggleTheme} member={member} onLogin={goLogin} onSignup={goSignup} onLogout={logout} onMyPage={openMyPage} onNotify={notify} />}{activeView === "home" && <Home onOpenLounge={openLounge} onOpenLolLounge={() => navigate("lol")} theme={theme} onToggleTheme={toggleTheme} member={member} onLogin={goLogin} onSignup={goSignup} onLogout={logout} onMyPage={openMyPage} />}{(activeView === "login" || activeView === "signup") && <EnhancedAuthPage mode={activeView} theme={theme} onToggleTheme={toggleTheme} onHome={() => navigate("home")} onModeChange={(nextView) => navigate(nextView)} onToast={notify} onSuccess={(loggedIn) => { updateMember(loggedIn); notify("로그인 되었습니다."); navigate(authReturnView, true); }} />}{member && isMyPageOpen && <MyPageModal member={member} onClose={() => setIsMyPageOpen(false)} />}{toast && <div className="toastMessage" role="status">{toast.text}</div>}<ScrollQuickButtons /><footer className="footer"><strong>LOUNGE COMMUNITY</strong><span>좋아하는 주제로 모이고 이야기하는 공간</span><span>© LOUNGE. All rights reserved.</span></footer></div>;
}

export default EnhancedApp;
