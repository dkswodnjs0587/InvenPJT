import { useEffect, useState } from "react";
import type { CSSProperties, FormEvent, ReactNode } from "react";
import "./App.css";

type Theme = "light" | "dark";
type View = "home" | "free" | "login" | "signup" | "mypage";

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
  createdAt: string;
  updatedAt: string | null;
};

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

function FreeBoard({ onHome, theme, onToggleTheme, member, onLogin, onSignup, onLogout, onMyPage = onHome }: { onHome: () => void; theme: Theme; onToggleTheme: () => void; member: Member | null; onLogin: () => void; onSignup: () => void; onLogout: () => void; onMyPage?: () => void }) {
  const [posts, setPosts] = useState<BoardPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<BoardPost | null>(null);
  const [isWriting, setIsWriting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [writeTitle, setWriteTitle] = useState("");
  const [writeContent, setWriteContent] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [writeAuthorName, setWriteAuthorName] = useState(member?.nickname || "");
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [isUpdatingPost, setIsUpdatingPost] = useState(false);
  const [error, setError] = useState("");
  const [detailError, setDetailError] = useState("");
  const [writeError, setWriteError] = useState("");
  const [editError, setEditError] = useState("");

  const formatDate = (createdAt: string) => {
    const date = new Date(createdAt);
    return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString("ko-KR");
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

  const openPostDetail = (postId: number) => {
    setIsDetailLoading(true);
    setDetailError("");

    fetch(`/api/posts/${postId}`, { credentials: "include" })
      .then(async (response) => {
        if (!response.ok) throw new Error("게시글 상세 정보를 불러오지 못했습니다.");
        return await response.json() as BoardPost;
      })
      .then((post) => {
        setSelectedPost(post);
        setPosts((currentPosts) => currentPosts.map((currentPost) => currentPost.id === post.id ? post : currentPost));
        window.scrollTo({ top: 0, behavior: "smooth" });
      })
      .catch((caughtError) => {
        setDetailError(caughtError instanceof Error ? caughtError.message : "잠시 후 다시 시도해 주세요.");
      })
      .finally(() => setIsDetailLoading(false));
  };

  const openWriteForm = () => {
    if (!member) {
      onLogin();
      return;
    }
    setSelectedPost(null);
    setIsEditing(false);
    setIsWriting(true);
    setWriteTitle("");
    setWriteContent("");
    setWriteAuthorName(member?.nickname || "");
    setWriteError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelWrite = () => {
    setIsWriting(false);
    setWriteTitle("");
    setWriteContent("");
    setWriteAuthorName(member?.nickname || "");
    setWriteError("");
  };

  const submitPost = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setWriteError("");

    const title = writeTitle.trim();
    const content = writeContent.trim();
    const authorName = (member?.nickname || writeAuthorName).trim();

    if (!title) {
      setWriteError("제목을 입력해 주세요.");
      return;
    }

    if (!content) {
      setWriteError("내용을 입력해 주세요.");
      return;
    }

    if (!authorName) {
      setWriteError("작성자 이름을 입력해 주세요.");
      return;
    }

    setIsSubmittingPost(true);

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          boardSlug: "free",
          title,
          content,
        }),
      });

      if (!response.ok) {
        throw new Error(await readError(response));
      }

      const createdPost = await response.json() as BoardPost;
      setPosts((currentPosts) => [createdPost, ...currentPosts]);
      setIsWriting(false);
      setWriteTitle("");
      setWriteContent("");
      setWriteAuthorName(member?.nickname || "");
      window.scrollTo({ top: 0, behavior: "smooth" });
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
      setSelectedPost(updatedPost);
      setPosts((currentPosts) => currentPosts.map((post) => post.id === updatedPost.id ? updatedPost : post));
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
      setSelectedPost(null);
    } catch (caughtError) {
      setDetailError(caughtError instanceof Error ? caughtError.message : "게시글을 삭제하지 못했습니다.");
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  useEffect(() => {
    if (member?.nickname) {
      setWriteAuthorName(member.nickname);
    }
  }, [member]);

  return (
    <>
      <Header
        onHome={onHome}
        theme={theme}
        onToggleTheme={onToggleTheme}
        member={member}
        onLogin={onLogin}
        onSignup={onSignup}
        onLogout={onLogout}
        onMyPage={onMyPage}
      />

      <main className="main boardPage">
        <div className="breadcrumbs">
          <button onClick={onHome}>홈</button>
          <span>›</span>
          <span>자유 게시판</span>
        </div>

        <section className="boardHero">
          <div>
            <span className="boardHeroIcon">💬</span>
            <div>
              <span className="eyebrow">FREE BOARD</span>
              <h1>자유 게시판</h1>
              <p>게임, 일상, 질문, 정보까지 자유롭게 이야기를 나누는 공간</p>
            </div>
          </div>
          <button className="writeButton" type="button" onClick={openWriteForm}>✎ 글쓰기</button>
        </section>

        {isWriting ? (
          <section className="boardTable" style={{ marginTop: 16 }}>
            <div className="tableTools">
              <b>게시글 작성</b>
              <div>
                <button type="button" className="sortSelected" onClick={cancelWrite}>목록으로</button>
              </div>
            </div>

            <form onSubmit={submitPost} style={{ display: "grid", gap: 14, padding: "24px 26px" }}>
              <label style={{ display: "grid", gap: 7, color: "var(--text)", fontSize: 13, fontWeight: 800 }}>
                제목
                <input
                  value={writeTitle}
                  onChange={(event) => setWriteTitle(event.target.value)}
                  placeholder="제목을 입력해 주세요"
                  maxLength={200}
                  required
                  style={{
                    height: 44,
                    padding: "0 13px",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    background: "var(--surface-soft)",
                    color: "var(--text)",
                  }}
                />
              </label>

              {!member && (
                <label style={{ display: "grid", gap: 7, color: "var(--text)", fontSize: 13, fontWeight: 800 }}>
                  작성자
                  <input
                    value={writeAuthorName}
                    onChange={(event) => setWriteAuthorName(event.target.value)}
                    placeholder="작성자 이름"
                    maxLength={50}
                    required
                    style={{
                      height: 44,
                      padding: "0 13px",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      background: "var(--surface-soft)",
                      color: "var(--text)",
                    }}
                  />
                </label>
              )}

              {member && (
                <p style={{ margin: 0, color: "var(--muted)", fontSize: 13 }}>
                  작성자: <b style={{ color: "var(--text)" }}>{member.nickname}</b>
                </p>
              )}

              <label style={{ display: "grid", gap: 7, color: "var(--text)", fontSize: 13, fontWeight: 800 }}>
                내용
                <textarea
                  value={writeContent}
                  onChange={(event) => setWriteContent(event.target.value)}
                  placeholder="내용을 입력해 주세요"
                  required
                  rows={12}
                  style={{
                    resize: "vertical",
                    minHeight: 220,
                    padding: 13,
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    background: "var(--surface-soft)",
                    color: "var(--text)",
                    font: "inherit",
                    lineHeight: 1.6,
                  }}
                />
              </label>

              {writeError && (
                <p className="authError" style={{ margin: 0 }}>{writeError}</p>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button type="button" className="authCancel" onClick={cancelWrite}>취소</button>
                <button className="authSubmit" disabled={isSubmittingPost} style={{ width: 110 }}>
                  {isSubmittingPost ? "등록 중..." : "등록"}
                </button>
              </div>
            </form>
          </section>
        ) : isEditing && selectedPost ? (
          <section className="boardTable" style={{ marginTop: 16 }}>
            <div className="tableTools">
              <b>게시글 수정</b>
              <button type="button" className="sortSelected" onClick={cancelEdit}>취소</button>
            </div>
            <form onSubmit={submitEdit} style={{ display: "grid", gap: 14, padding: "24px 26px" }}>
              <label style={{ display: "grid", gap: 7, color: "var(--text)", fontSize: 13, fontWeight: 800 }}>
                제목
                <input value={editTitle} onChange={(event) => setEditTitle(event.target.value)} maxLength={200} required style={{ height: 44, padding: "0 13px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--surface-soft)", color: "var(--text)" }} />
              </label>
              <label style={{ display: "grid", gap: 7, color: "var(--text)", fontSize: 13, fontWeight: 800 }}>
                내용
                <textarea value={editContent} onChange={(event) => setEditContent(event.target.value)} rows={12} required style={{ resize: "vertical", minHeight: 220, padding: 13, border: "1px solid var(--border)", borderRadius: 8, background: "var(--surface-soft)", color: "var(--text)", font: "inherit", lineHeight: 1.6 }} />
              </label>
              {editError && <p className="authError" style={{ margin: 0 }}>{editError}</p>}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button type="button" className="authCancel" onClick={cancelEdit}>취소</button>
                <button className="authSubmit" disabled={isUpdatingPost} style={{ width: 110 }}>{isUpdatingPost ? "수정 중..." : "수정 완료"}</button>
              </div>
            </form>
          </section>
        ) : selectedPost ? (
          <section className="boardTable" style={{ marginTop: 16 }}>
            <div className="tableTools">
              <b>게시글 상세</b>
              <div>
                <button type="button" className="sortSelected" onClick={() => setSelectedPost(null)}>목록으로</button>
              </div>
            </div>

            {isDetailLoading && (
              <article className="postRow">
                <span>-</span>
                <span>게시글을 불러오는 중입니다.</span>
                <span>-</span>
                <span>-</span>
                <span>-</span>
                <span>-</span>
              </article>
            )}

            {detailError && (
              <article className="postRow">
                <span>-</span>
                <span>{detailError}</span>
                <span>-</span>
                <span>-</span>
                <span>-</span>
                <span>-</span>
              </article>
            )}

            {!isDetailLoading && !detailError && (
              <article style={{ padding: "28px 30px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16, borderBottom: "1px solid var(--row-border)", paddingBottom: 18 }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: 24 }}>{selectedPost.title}</h2>
                    <p style={{ margin: "10px 0 0", color: "var(--muted)", fontSize: 13 }}>
                      {selectedPost.authorName} · {formatDate(selectedPost.createdAt)} · 조회 {selectedPost.viewCount}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {isMyPost(selectedPost) && <>
                      <button type="button" className="textButton" onClick={beginEdit}>수정</button>
                      <button type="button" className="textButton" onClick={deleteSelectedPost}>삭제</button>
                    </>}
                    <button type="button" className="textButton" onClick={() => setSelectedPost(null)}>목록</button>
                  </div>
                </div>

                <div style={{ minHeight: 220, paddingTop: 24, whiteSpace: "pre-wrap", lineHeight: 1.75, color: "var(--text)" }}>
                  {selectedPost.content}
                </div>
              </article>
            )}
          </section>
        ) : (
          <>
            <section className="boardTabs">
              <button className="selected">전체</button>
              <button>잡담</button>
              <button>질문</button>
              <button>정보</button>
              <button>공략</button>
              <button>인증</button>
            </section>

            <div className="boardLayout">
              <section className="boardTable">
                <div className="tableTools">
                  <b>전체 글 <strong>{posts.length}</strong></b>
                  <div>
                    <button className="sortSelected">최신순</button>
                    <button>추천순</button>
                    <button>조회순</button>
                  </div>
                </div>

                <div className="tableHead">
                  <span>번호</span>
                  <span>제목</span>
                  <span>글쓴이</span>
                  <span>작성일</span>
                  <span>조회</span>
                  <span>추천</span>
                </div>

                {isLoading && (
                  <article className="postRow">
                    <span>-</span>
                    <span>게시글을 불러오는 중입니다.</span>
                    <span>-</span>
                    <span>-</span>
                    <span>-</span>
                    <span>-</span>
                  </article>
                )}

                {error && (
                  <article className="postRow">
                    <span>-</span>
                    <span>{error}</span>
                    <span>-</span>
                    <span>-</span>
                    <span>-</span>
                    <span>-</span>
                  </article>
                )}

                {!isLoading && !error && posts.length === 0 && (
                  <article className="postRow">
                    <span>-</span>
                    <span>아직 등록된 게시글이 없습니다.</span>
                    <span>-</span>
                    <span>-</span>
                    <span>-</span>
                    <span>-</span>
                  </article>
                )}

                {!isLoading && !error && posts.map((post) => (
                  <article className="postRow" key={post.id}>
                    <span>{post.id}</span>
                    <button type="button" className="postLink" onClick={() => openPostDetail(post.id)}>
                      {post.title}
                      <small> [0]</small>
                    </button>
                    <span>{post.authorName}</span>
                    <span>{formatDate(post.createdAt)}</span>
                    <span>{post.viewCount}</span>
                    <span>0</span>
                  </article>
                ))}

                <div className="pagination">
                  <button>‹</button>
                  <button className="current">1</button>
                  <button>2</button>
                  <button>3</button>
                  <button>4</button>
                  <button>5</button>
                  <button>›</button>
                </div>
              </section>

              <aside className="boardAside">
                <section>
                  <h2>자유 게시판 인기글</h2>
                  <ol>
                    {posts.slice(0, 5).map((post) => (
                      <li key={`popular-${post.id}`}>{post.title}</li>
                    ))}
                    {posts.length === 0 && <li>게시글이 등록되면 표시됩니다.</li>}
                  </ol>
                </section>

                <section className="asideNotice">
                  <b>처음 오셨나요?</b>
                  <p>게시판 이용 수칙을 확인하고 즐겁게 참여해 주세요.</p>
                  <a href="#guide">이용 안내 보기 →</a>
                </section>
              </aside>
            </div>
          </>
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
  return view === "login" || view === "signup" || view === "mypage" ? view : "home";
}

function getCachedMember(): Member | null {
  try {
    const saved = localStorage.getItem(MEMBER_CACHE_KEY);
    if (!saved) return null;
    const parsed: unknown = JSON.parse(saved);
    if (
      !parsed || typeof parsed !== "object" ||
      typeof (parsed as Member).id !== "number" ||
      typeof (parsed as Member).username !== "string" ||
      typeof (parsed as Member).nickname !== "string" ||
      typeof (parsed as Member).email !== "string"
    ) {
      localStorage.removeItem(MEMBER_CACHE_KEY);
      return null;
    }
    return parsed as Member;
  } catch {
    localStorage.removeItem(MEMBER_CACHE_KEY);
    return null;
  }
}

async function readError(response: Response) {
  if (response.status === 401) return "아이디 또는 비밀번호가 올바르지 않습니다.";
  if (response.status === 409) return "이미 사용 중인 아이디, 닉네임 또는 이메일입니다.";
  if (response.status === 400) return "입력한 정보를 다시 확인해 주세요.";
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const body = await response.json() as { message?: string; detail?: string; errors?: Array<{ defaultMessage?: string }> };
    return body.errors?.[0]?.defaultMessage || body.detail || body.message || "요청을 처리하지 못했습니다.";
  }
  return (await response.text()) || "요청을 처리하지 못했습니다.";
}

const categories: Category[] = [
  { id: 1, title: "롤 라운지", icon: "⚔️", color: "#2563eb", description: "리그 오브 레전드" },
  { id: 2, title: "피파 라운지", icon: "⚽", color: "#16a34a", description: "축구 게임 커뮤니티" },
  { id: 3, title: "메이플 라운지", icon: "🍁", color: "#dc2626", description: "메이플스토리" },
  { id: 4, title: "축구 라운지", icon: "🏟️", color: "#ea580c", description: "축구 이야기" },
  { id: 5, title: "농구 라운지", icon: "🏀", color: "#f97316", description: "농구 이야기" },
  { id: 6, title: "배드민턴 라운지", icon: "🏸", color: "#0891b2", description: "배드민턴 이야기" },
];

const defaultRecentSearches = ["롤 패치노트", "메이플 이벤트", "피파 스쿼드", "농구 하이라이트"];
const realtimeKeywords = ["롤 전적", "메이플 하이퍼버닝", "피파 신규 시즌", "축구 이적시장", "농구 플레이오프", "배드민턴 라켓", "라운지 이벤트", "게임 쿠폰", "자유 게시판", "오늘의 인기글"];



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

function Header({ onHome, theme, onToggleTheme, member, onLogin, onSignup, onLogout, onMyPage = onHome }: { onHome: () => void; theme: Theme; onToggleTheme: () => void; member: Member | null; onLogin: () => void; onSignup: () => void; onLogout: () => void; onMyPage?: () => void }) {
  const [keyword, setKeyword] = useState("");
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
  const [showRecentSearches, setShowRecentSearches] = useState(() => localStorage.getItem("hideRecentSearches") !== "true");

  useEffect(() => {
    localStorage.setItem("recentSearches", JSON.stringify(recentSearches));
  }, [recentSearches]);

  const submitSearch = () => {
    const nextKeyword = keyword.trim();
    if (!nextKeyword) return;
    setRecentSearches((current) => [nextKeyword, ...current.filter((item) => item !== nextKeyword)].slice(0, 6));
  };

  const hideRecent = () => {
    setShowRecentSearches(false);
    localStorage.setItem("hideRecentSearches", "true");
  };

  const removeRecent = (target: string) => {
    setRecentSearches((current) => current.filter((item) => item !== target));
  };

  return <header className="header"><button className="logo logoButton" onClick={onHome}><img className="brandLogo" src="/brand/lounge-logo.png" alt="" /><span>LOUNGE</span><small>COMMUNITY</small></button><div className="searchArea"><form className="searchBox" onSubmit={(event) => { event.preventDefault(); submitSearch(); }}><input type="search" aria-label="게시판 검색" placeholder="게시판, 글, 유저를 검색해보세요" value={keyword} onChange={(event) => setKeyword(event.target.value)} onFocus={() => setIsSearchFocused(true)} onBlur={() => setIsSearchFocused(false)} /><button aria-label="검색">⌕</button></form>{isSearchFocused && <section className={`recentSearches ${showRecentSearches ? "" : "recentSearchesFolded"}`} onMouseDown={(event) => event.preventDefault()}>{showRecentSearches ? <><div className="recentTitle"><b>최근 검색어</b><button onClick={() => setRecentSearches([])}>전체 삭제</button></div>{recentSearches.length > 0 ? <ul>{recentSearches.map((item) => <li key={item}><button className="recentKeyword" onClick={() => setKeyword(item)}>{item}</button><button className="recentDeleteButton" aria-label={`${item} 삭제`} onClick={() => removeRecent(item)}>×</button></li>)}</ul> : <p className="recentEmpty">최근 검색어가 없습니다.</p>}<button className="recentOffButton" onClick={hideRecent}>최근 검색어 보기 끄기</button></> : <div className="recentFolded"><span>최근 검색어 보기가 꺼져 있습니다.</span><button onClick={() => { setRecentSearches([]); setShowRecentSearches(true); localStorage.removeItem("hideRecentSearches"); }}>최근 검색어 보기</button></div>}</section>}</div><button className="menuToggle" type="button" aria-label="메뉴 열기" onClick={() => setIsMenuOpen((current) => !current)}>☰</button><div className={`userActions ${isMenuOpen ? "open" : ""}`}><button className="themeToggle" type="button" aria-label={theme === "dark" ? "라이트 모드로 변경" : "다크 모드로 변경"} onClick={onToggleTheme}>{theme === "dark" ? "☀" : "☾"}</button>{member ? <><span className="memberGreeting"><b>{member.nickname}</b>님</span><button className="myPageBtn" onClick={onMyPage}>마이페이지</button><button className="loginBtn" onClick={onLogout}>로그아웃</button></> : <><button className="loginBtn" onClick={onLogin}>로그인</button><button className="joinBtn" onClick={onSignup}>회원가입</button></>}</div></header>;
}


function Home({ onOpenFreeBoard, theme, onToggleTheme, member, onLogin, onSignup, onLogout, onMyPage = onLogin }: { onOpenFreeBoard: () => void; theme: Theme; onToggleTheme: () => void; member: Member | null; onLogin: () => void; onSignup: () => void; onLogout: () => void; onMyPage?: () => void }) {
  const latestPosts = [...homepageHotPosts, ...homepageRecommendedPosts.slice(0, 2)].map((post) => ({ ...post, isNew: true }));

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
                <button className={`categoryCard ${category.id !== 1 ? "comingSoon" : ""}`} key={category.id} style={{ "--point-color": category.color } as CSSProperties} onClick={category.id === 1 ? onOpenFreeBoard : undefined}>
                  <span className="categoryIcon">{category.icon}</span>
                  <span>
                    <b>{category.title}</b>
                    <small>{category.id === 1 ? "새 탭에서 라운지 입장" : `${category.description} · 준비 중`}</small>
                  </span>
                  <i>{category.id === 1 ? "↗" : "·"}</i>
                </button>
              ))}
            </div>
          </section>
          <aside className="realtimePanel">
            <div className="panelHeading">
              <div>
                <h2>실시간 검색어</h2>
                <p>지금 많이 찾는 키워드</p>
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
              <button className="textButton" onClick={onOpenFreeBoard}>더보기 →</button>
            </div>
            <ul className="postList hotPostList">
              {homepageHotPosts.map((post) => (
                <li key={post.title}>
                  <span className="boardName">{post.board}</span>
                  <button className="postLink" onClick={post.board === "자유 게시판" ? onOpenFreeBoard : undefined}>{post.title}</button>
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

function EnhancedAuthPage({ mode, theme, onToggleTheme, onHome, onModeChange, onSuccess }: { mode: "login" | "signup"; theme: Theme; onToggleTheme: () => void; onHome: () => void; onModeChange: (mode: View) => void; onSuccess: (member: Member) => void }) {
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

  useEffect(() => {
    setUsername("");
    setNickname("");
    setEmail("");
    setEmailError("");
    setPassword("");
    setPasswordConfirm("");
    setShowPassword(false);
    setShowSignupPassword(false);
    setShowPasswordConfirm(false);
    setError("");
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
        body: JSON.stringify(isSignup ? { username, password, nickname: nickname.trim(), email: email.trim() } : { username, password }),
      });
      if (!response.ok) throw new Error(await readError(response));
      const loggedIn = await response.json() as Member;
      if (isSignup) {
        onModeChange("login");
        return;
      }
      onSuccess(loggedIn);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "잠시 후 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
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
      <p>{isSignup ? "라운지 커뮤니티에서 사용할 계정을 만들어보세요." : "계정으로 로그인하고 커뮤니티를 이어가세요."}</p>
      <form className="authForm" onSubmit={submitAuth}>
        {isSignup && <>
          <label>닉네임<input value={nickname} onChange={(event) => setNickname(event.target.value)} placeholder="커뮤니티 닉네임" autoComplete="nickname" required minLength={2} maxLength={30} /></label>
          <label>이메일<input type="email" value={email} onChange={(event) => { setEmail(event.target.value); if (emailError) validateEmail(event.target.value); }} onBlur={(event) => validateEmail(event.target.value)} onInvalid={(event) => event.currentTarget.setCustomValidity("정확한 형식으로 이메일을 입력하세요.")} onInput={(event) => event.currentTarget.setCustomValidity("")} placeholder="email@example.com" autoComplete="email" required maxLength={254} />{emailError && <span className="fieldError">{emailError}</span>}</label>
        </>}
        <label>아이디<input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="영문, 숫자 7자 이상" autoComplete="username" required minLength={7} maxLength={30} pattern="[A-Za-z0-9]{7,30}" title="아이디는 영문과 숫자 7~30자로 입력해 주세요." /><small>영문과 숫자만 사용해 7~30자로 입력해 주세요.</small></label>
        <label>비밀번호{isSignup ? passwordField(password, setPassword, showSignupPassword, setShowSignupPassword, "8자 이상 입력하세요", "비밀번호") : <span className="passwordInput"><input type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="8자 이상 입력하세요" autoComplete="current-password" required minLength={8} maxLength={72} /><button type="button" className="passwordToggle" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}>◉</button></span>}<small>8~72자로 입력해 주세요.</small></label>
        {isSignup && <label>비밀번호 확인{passwordField(passwordConfirm, setPasswordConfirm, showPasswordConfirm, setShowPasswordConfirm, "비밀번호를 한 번 더 입력하세요", "비밀번호 확인")}</label>}
        {error && <p className="authError">{error}</p>}
        {isSignup ? <div className="authActions"><button type="button" className="authCancel" onClick={onHome}>취소</button><button className="authSubmit" disabled={isSubmitting}>{isSubmitting ? "처리 중..." : "가입하기"}</button></div> : <button className="authSubmit" disabled={isSubmitting}>{isSubmitting ? "처리 중..." : "로그인"}</button>}
      </form>
      <p className="authSwitch">{isSignup ? "이미 계정이 있나요?" : "아직 계정이 없나요?"} <button onClick={() => onModeChange(isSignup ? "login" : "signup")}>{isSignup ? "로그인" : "회원가입"}</button></p>
    </section></main>
  </>;
}

function MyPage({ member, header }: { member: Member; header: ReactNode }) {
  const [saved, setSaved] = useState(false);

  return <>{header}<main className="main myPage"><div className="breadcrumbs"><span>홈</span><span>›</span><span>마이페이지</span></div><section className="myPageGrid"><section className="myProfileCard"><div className="profileBadge">{member.nickname.slice(0, 1)}</div><div><span className="eyebrow">MY LOUNGE</span><h1>{member.nickname}님의 라운지</h1><p>{member.username} · {member.email || "이메일 미등록"}</p></div></section><section className="mySettingsCard"><div className="panelHeading"><div><h2>커뮤니티 설정</h2><p>나에게 맞는 라운지를 설정하세요</p></div></div><form onSubmit={(event) => { event.preventDefault(); setSaved(true); }}><label>관심 게시판<select defaultValue="자유 게시판"><option>자유 게시판</option><option>게임 게시판</option><option>공략 게시판</option></select></label><label className="checkLabel"><input type="checkbox" defaultChecked /> 인기글 알림 받기</label><label className="checkLabel"><input type="checkbox" defaultChecked /> 내 글의 댓글 알림 받기</label><button className="authSubmit">설정 저장</button>{saved && <p className="settingsSaved">설정이 저장되었습니다.</p>}</form></section></section><section className="myActivity"><h2>나의 활동</h2><div><strong>0</strong><span>작성한 글</span></div><div><strong>0</strong><span>받은 댓글</span></div><div><strong>0</strong><span>북마크</span></div></section></main></>;
}


function EnhancedApp() {
  const [activeView, setActiveView] = useState<View>(readView);
  const [member, setMember] = useState<Member | null>(getCachedMember);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light" || savedTheme === "dark") return savedTheme;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  const updateMember = (next: Member | null) => {
    setMember(next);
    if (next) localStorage.setItem(MEMBER_CACHE_KEY, JSON.stringify(next));
    else localStorage.removeItem(MEMBER_CACHE_KEY);
  };

  const navigate = (nextView: View, replace = false) => {
    const url = new URL(window.location.href);
    url.search = "";
    if (nextView === "free") url.searchParams.set("board", "free");
    if (nextView === "login" || nextView === "signup" || nextView === "mypage") url.searchParams.set("view", nextView);
    window.history[replace ? "replaceState" : "pushState"]({ view: nextView }, "", url);
    setActiveView(nextView);
    window.scrollTo(0, 0);
  };

  const toggleTheme = () => setTheme((current) => current === "dark" ? "light" : "dark");
  const openFreeBoard = () => window.open(`${window.location.pathname}?board=free`, "_blank", "noopener,noreferrer");
  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" }).catch(() => undefined);
    updateMember(null);
    navigate("home", true);
  };

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
    if (sessionChecked && activeView === "mypage" && !member) navigate("login", true);
  }, [activeView, member, sessionChecked]);

  const header = <Header onHome={() => navigate("home")} theme={theme} onToggleTheme={toggleTheme} member={member} onLogin={() => navigate("login")} onSignup={() => navigate("signup")} onLogout={logout} onMyPage={() => navigate("mypage")} />;

  return <div className="app">{activeView === "free" && <FreeBoard onHome={() => navigate("home")} theme={theme} onToggleTheme={toggleTheme} member={member} onLogin={() => navigate("login")} onSignup={() => navigate("signup")} onLogout={logout} onMyPage={() => navigate("mypage")} />}{activeView === "home" && <Home onOpenFreeBoard={openFreeBoard} theme={theme} onToggleTheme={toggleTheme} member={member} onLogin={() => navigate("login")} onSignup={() => navigate("signup")} onLogout={logout} onMyPage={() => navigate("mypage")} />}{(activeView === "login" || activeView === "signup") && <EnhancedAuthPage mode={activeView} theme={theme} onToggleTheme={toggleTheme} onHome={() => navigate("home")} onModeChange={(nextView) => navigate(nextView)} onSuccess={(loggedIn) => { updateMember(loggedIn); navigate("home", true); }} />}{activeView === "mypage" && member && <MyPage member={member} header={header} />}<footer className="footer"><strong>LOUNGE COMMUNITY</strong><span>좋아하는 주제로 모이고 이야기하는 공간</span><span>© LOUNGE. All rights reserved.</span></footer></div>;
}

export default EnhancedApp;
