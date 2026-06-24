import { useEffect, useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import "./App.css";

type Theme = "light" | "dark";
type View = "home" | "free" | "login" | "signup" | "mypage";
type Category = { id: number; title: string; icon: string; color: string; description: string };
type BoardPost = { no: number; title: string; author: string; date: string; views: number; likes: number; notice?: boolean; tag?: string };
type HomePost = { board: string; title: string; author: string; count: number; time: string; isHot?: boolean; isNew?: boolean };
type HotImagePost = { tag: string; title: string; image: string };
type Member = { id: number; username: string; nickname: string; email: string };

const categories: Category[] = [
  { id: 1, title: "롤 인벤", icon: "⚔️", color: "#2563eb", description: "리그 오브 레전드" },
  { id: 2, title: "피파 인벤", icon: "⚽", color: "#16a34a", description: "축구 게임 커뮤니티" },
  { id: 3, title: "메이플 인벤", icon: "🍁", color: "#dc2626", description: "메이플스토리" },
  { id: 4, title: "축구 인벤", icon: "🏟️", color: "#ea580c", description: "축구 이야기" },
  { id: 5, title: "농구 인벤", icon: "🏀", color: "#f97316", description: "농구 이야기" },
  { id: 6, title: "배드민턴 인벤", icon: "🏸", color: "#0891b2", description: "배드민턴 이야기" },
];

const defaultRecentSearches = ["롤 패치노트", "메이플 이벤트", "피파 스쿼드", "농구 하이라이트"];
const realtimeKeywords = ["롤 전적", "메이플 하이퍼버닝", "피파 신규 시즌", "축구 이적시장", "농구 플레이오프", "배드민턴 라켓", "인벤 이벤트", "게임 쿠폰", "자유 게시판", "오늘의 인기글"];

const freeBoardPosts: BoardPost[] = [
  { no: 0, title: "[안내] 자유 게시판 이용 수칙", author: "운영자", date: "2026.06.23", views: 1240, likes: 16, notice: true },
  { no: 0, title: "[공지] 커뮤니티 업데이트 및 개선 예정 안내", author: "운영자", date: "2026.06.22", views: 890, likes: 42, notice: true },
  { no: 3812, title: "오늘 업데이트 이후 체감 어떤가요?", author: "인벤러", date: "12:48", views: 326, likes: 42, tag: "잡담" },
  { no: 3811, title: "복귀 유저인데 지금 시작해도 괜찮나요?", author: "복귀유저", date: "12:31", views: 187, likes: 18, tag: "질문" },
  { no: 3810, title: "이번 주 이벤트 보상 정리해봤습니다", author: "겜잘알", date: "11:54", views: 240, likes: 31, tag: "정보" },
  { no: 3809, title: "초보자가 먼저 챙기면 좋은 세팅 모음", author: "공략러", date: "11:20", views: 155, likes: 22, tag: "공략" },
  { no: 3808, title: "거래 전 꼭 확인해야 할 체크리스트", author: "안전거래", date: "10:42", views: 128, likes: 9, tag: "거래" },
  { no: 3807, title: "드디어 목표 달성했습니다", author: "기록쟁이", date: "09:57", views: 214, likes: 27, tag: "인증" },
];

const homepageHotPosts: HomePost[] = [
  { board: "자유 게시판", title: "오늘 업데이트 이후 체감 어떤가요?", author: "인벤러", count: 42, time: "12:48", isHot: true, isNew: true },
  { board: "게임 게시판", title: "이번 주 이벤트 보상 정리해봤습니다", author: "겜잘알", count: 31, time: "12:15", isHot: true, isNew: true },
  { board: "공략 게시판", title: "초보자가 먼저 챙기면 좋은 세팅 모음", author: "공략러", count: 28, time: "11:43", isHot: true, isNew: true },
  { board: "롤 인벤", title: "이번 패치 이후 라인전 느낌이 확 달라졌네요", author: "탑장인", count: 24, time: "11:10", isHot: true },
  { board: "피파 인벤", title: "가성비 스쿼드 맞출 때 은근 좋은 선수들", author: "감독님", count: 21, time: "10:52", isHot: true },
  { board: "메이플 인벤", title: "주간 보스 돌기 전에 챙기면 좋은 것들", author: "단풍러", count: 19, time: "10:28", isHot: true },
];

const homepageRecommendedPosts: HomePost[] = [
  { board: "공략 게시판", title: "자주 묻는 질문 한 번에 보기", author: "관리자", count: 16, time: "어제" },
  { board: "거래 게시판", title: "거래 전 꼭 확인해야 할 체크리스트", author: "안전거래", count: 14, time: "어제" },
  { board: "게임 게시판", title: "이번 시즌 주요 변경점 요약", author: "소식통", count: 12, time: "월요일" },
  { board: "축구 인벤", title: "입문자가 보기 좋은 포지션별 역할 정리", author: "축덕", count: 11, time: "월요일" },
  { board: "농구 인벤", title: "처음 보는 사람도 이해되는 전술 용어 모음", author: "코트위", count: 9, time: "일요일" },
  { board: "배드민턴 인벤", title: "라켓 고를 때 무게보다 먼저 봐야 할 것", author: "셔틀콕", count: 8, time: "일요일" },
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

function Header({ onHome, theme, onToggleTheme, member, isAuthReady, onLogin, onSignup, onMyPage, onLogout }: { onHome: () => void; theme: Theme; onToggleTheme: () => void; member: Member | null; isAuthReady: boolean; onLogin: () => void; onSignup: () => void; onMyPage: () => void; onLogout: () => void }) {
  const [keyword, setKeyword] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem("recentSearches");
    return saved ? JSON.parse(saved) : defaultRecentSearches;
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

  return <header className="header"><button className="logo logoButton" onClick={onHome}><span className="logoBox">I</span><span>INVEN</span><small>COMMUNITY</small></button><div className="searchArea"><form className="searchBox" onSubmit={(event) => { event.preventDefault(); submitSearch(); }}><input type="search" aria-label="게시판 검색" placeholder="게시판, 글, 유저를 검색해보세요" value={keyword} onChange={(event) => setKeyword(event.target.value)} onFocus={() => setIsSearchFocused(true)} onBlur={() => setIsSearchFocused(false)} /><button aria-label="검색">⌕</button></form>{isSearchFocused && <section className={`recentSearches ${showRecentSearches ? "" : "recentSearchesFolded"}`} onMouseDown={(event) => event.preventDefault()}>{showRecentSearches ? <><div className="recentTitle"><b>최근 검색어</b><button onClick={() => setRecentSearches([])}>전체 삭제</button></div>{recentSearches.length > 0 ? <ul>{recentSearches.map((item) => <li key={item}><button className="recentKeyword" onClick={() => setKeyword(item)}>{item}</button><button className="recentDeleteButton" aria-label={`${item} 삭제`} onClick={() => removeRecent(item)}>×</button></li>)}</ul> : <p className="recentEmpty">최근 검색어가 없습니다.</p>}<button className="recentOffButton" onClick={hideRecent}>최근 검색어 보기 끄기</button></> : <div className="recentFolded"><span>최근 검색어 보기가 꺼져 있습니다.</span><button onClick={() => { setRecentSearches([]); setShowRecentSearches(true); localStorage.removeItem("hideRecentSearches"); }}>최근 검색어 보기</button></div>}</section>}</div><button className="menuToggle" type="button" aria-label="메뉴 열기" onClick={() => setIsMenuOpen((current) => !current)}>☰</button><div className={`userActions ${isMenuOpen ? "open" : ""}`}><button className="themeToggle" type="button" aria-label={theme === "dark" ? "라이트 모드로 변경" : "다크 모드로 변경"} onClick={onToggleTheme}>{theme === "dark" ? "☀" : "☾"}</button>{!isAuthReady ? <span className="authLoading" aria-label="로그인 상태 확인 중" /> : member ? <><span className="memberGreeting"><b>{member.nickname}</b>님</span><button className="myPageBtn" onClick={onMyPage}>마이페이지</button><button className="loginBtn" onClick={onLogout}>로그아웃</button></> : <><button className="loginBtn" onClick={onLogin}>로그인</button><button className="joinBtn" onClick={onSignup}>회원가입</button></>}</div></header>;
}

function FreeBoard({ onHome, theme, onToggleTheme, member, isAuthReady, onLogin, onSignup, onMyPage, onLogout }: { onHome: () => void; theme: Theme; onToggleTheme: () => void; member: Member | null; isAuthReady: boolean; onLogin: () => void; onSignup: () => void; onMyPage: () => void; onLogout: () => void }) {
  return <><Header onHome={onHome} theme={theme} onToggleTheme={onToggleTheme} member={member} isAuthReady={isAuthReady} onLogin={onLogin} onSignup={onSignup} onMyPage={onMyPage} onLogout={onLogout} /><main className="main boardPage"><div className="breadcrumbs"><button onClick={onHome}>홈</button><span>›</span><span>자유 게시판</span></div><section className="boardHero"><div><span className="boardHeroIcon">💬</span><div><span className="eyebrow">FREE BOARD</span><h1>자유 게시판</h1><p>게임, 일상, 질문, 정보까지 자유롭게 이야기를 나누는 공간</p></div></div><button className="writeButton">✎ 글쓰기</button></section><section className="boardTabs"><button className="selected">전체</button><button>잡담</button><button>질문</button><button>정보</button><button>공략</button><button>인증</button></section><div className="boardLayout"><section className="boardTable"><div className="tableTools"><b>전체 글 <strong>3,812</strong></b><div><button className="sortSelected">최신순</button><button>추천순</button><button>조회순</button></div></div><div className="tableHead"><span>번호</span><span>제목</span><span>글쓴이</span><span>작성일</span><span>조회</span><span>추천</span></div>{freeBoardPosts.map((post) => <article className={`postRow ${post.notice ? "noticeRow" : ""}`} key={`${post.no}-${post.title}`}><span>{post.notice ? "공지" : post.no}</span><a href="#post">{post.tag && <em>{post.tag}</em>}{post.title}<small> [{post.likes}]</small></a><span>{post.author}</span><span>{post.date}</span><span>{post.views}</span><span>{post.likes}</span></article>)}<div className="pagination"><button>‹</button><button className="current">1</button><button>2</button><button>3</button><button>4</button><button>5</button><button>›</button></div></section><aside className="boardAside"><section><h2>자유 게시판 인기글</h2><ol><li>이번 시즌 주요 변경점 요약</li><li>복귀 유저를 위한 시작 가이드</li><li>오늘의 인기 스크린샷</li><li>초보자가 자주 묻는 질문</li><li>거래 전 확인할 체크리스트</li></ol></section><section className="asideNotice"><b>처음 오셨나요?</b><p>게시판 이용 수칙을 확인하고 즐겁게 참여해 주세요.</p><a href="#guide">이용 안내 보기 →</a></section></aside></div></main></>;
}

function Home({ onOpenFreeBoard, theme, onToggleTheme, member, isAuthReady, onLogin, onSignup, onMyPage, onLogout }: { onOpenFreeBoard: () => void; theme: Theme; onToggleTheme: () => void; member: Member | null; isAuthReady: boolean; onLogin: () => void; onSignup: () => void; onMyPage: () => void; onLogout: () => void }) {
  const latestPosts = [...homepageHotPosts, ...homepageRecommendedPosts.slice(0, 2)].map((post) => ({ ...post, isNew: true }));

  return (
    <>
      <Header onHome={() => window.scrollTo({ top: 0, behavior: "smooth" })} theme={theme} onToggleTheme={onToggleTheme} member={member} isAuthReady={isAuthReady} onLogin={onLogin} onSignup={onSignup} onMyPage={onMyPage} onLogout={onLogout} />
      <main className="main" id="home">
        <div className="directoryLayout">
          <section className="categorySection" aria-labelledby="category-title">
            <div className="sectionHeading">
              <div>
                <span className="eyebrow">BOARD DIRECTORY</span>
                <h2 id="category-title">모든 인벤</h2>
              </div>
              <span>관심 있는 커뮤니티를 찾아보세요</span>
            </div>
            <div className="categoryGrid">
              {categories.map((category) => (
                <button className={`categoryCard ${category.id !== 1 ? "comingSoon" : ""}`} key={category.id} style={{ "--point-color": category.color } as CSSProperties} onClick={category.id === 1 ? onOpenFreeBoard : undefined}>
                  <span className="categoryIcon">{category.icon}</span>
                  <span>
                    <b>{category.title}</b>
                    <small>{category.id === 1 ? "새 탭에서 인벤 입장" : `${category.description} · 준비 중`}</small>
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

function AuthPage({ mode, theme, onToggleTheme, onHome, onModeChange, onSuccess }: { mode: "login" | "signup"; theme: Theme; onToggleTheme: () => void; onHome: () => void; onModeChange: (mode: "login" | "signup") => void; onSuccess: (member: Member) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSignup = mode === "signup";

  const submitAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!/^[a-zA-Z0-9]{7,30}$/.test(username)) {
      setError("아이디는 영문과 숫자 7~30자로 입력해 주세요.");
      return;
    }
    if (password.length < 8 || password.length > 72) {
      setError("비밀번호는 8~72자로 입력해 주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/auth/${isSignup ? "signup" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(isSignup ? { username, password, nickname, email } : { username, password }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("아이디 또는 비밀번호가 올바르지 않습니다.");
        }
        if (response.status === 409) {
          throw new Error("이미 사용 중인 아이디, 닉네임, 이메일입니다.");
        }
        if (response.status === 400) {
          throw new Error("입력한 정보를 다시 확인해 주세요.");
        }
        throw new Error("요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.");
      }

      const member = await response.json() as Member;
      onSuccess(member);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "잠시 후 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return <><Header onHome={onHome} theme={theme} onToggleTheme={onToggleTheme} member={null} isAuthReady={true} onLogin={() => onModeChange("login")} onSignup={() => onModeChange("signup")} onMyPage={() => onModeChange("login")} onLogout={() => undefined} /><main className="authMain"><section className="authCard"><div className="authMark">I</div><span className="eyebrow">{isSignup ? "CREATE ACCOUNT" : "WELCOME BACK"}</span><h1>{isSignup ? "회원가입" : "로그인"}</h1><p>{isSignup ? "인벤 커뮤니티에서 사용할 계정을 만들어보세요." : "계정으로 로그인하고 커뮤니티를 이어가세요."}</p><form className="authForm" onSubmit={submitAuth}>{isSignup && <><label>닉네임<input value={nickname} onChange={(event) => setNickname(event.target.value)} placeholder="커뮤니티 닉네임" required /></label><label>이메일<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="email@example.com" required /></label></>}<label>아이디<input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="아이디" required /><small>영문과 숫자만 사용해 7~30자로 입력해 주세요.</small></label><label>비밀번호<span className="passwordInput"><input type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="비밀번호" required /><button type="button" className="passwordToggle" onClick={() => setShowPassword((current) => !current)}>{showPassword ? "숨김" : "보기"}</button></span><small>8~72자로 입력해 주세요.</small></label>{error && <p className="authError">{error}</p>}<button className="authSubmit" disabled={isSubmitting}>{isSubmitting ? "처리 중..." : isSignup ? "회원가입" : "로그인"}</button></form><p className="authSwitch">{isSignup ? "이미 계정이 있나요?" : "아직 계정이 없나요?"} <button onClick={() => onModeChange(isSignup ? "login" : "signup")}>{isSignup ? "로그인" : "회원가입"}</button></p></section></main></>;
}


function MyPage({ member, theme, onToggleTheme, onHome, onLogin, onSignup, onMyPage, onLogout }: { member: Member; theme: Theme; onToggleTheme: () => void; onHome: () => void; onLogin: () => void; onSignup: () => void; onMyPage: () => void; onLogout: () => void }) {
  const [saved, setSaved] = useState(false);

  return <><Header onHome={onHome} theme={theme} onToggleTheme={onToggleTheme} member={member} isAuthReady={true} onLogin={onLogin} onSignup={onSignup} onMyPage={onMyPage} onLogout={onLogout} /><main className="main myPage"><div className="breadcrumbs"><button onClick={onHome}>홈</button><span>›</span><span>마이페이지</span></div><section className="myPageGrid"><section className="myProfileCard"><div className="profileBadge">{member.nickname.slice(0, 1)}</div><div><span className="eyebrow">MY COMMUNITY</span><h1>{member.nickname}님의 마이페이지</h1><p>{member.username} · {member.email}</p></div></section><section className="mySettingsCard"><div className="panelHeading"><div><h2>커뮤니티 설정</h2><p>자주 보는 게시판과 알림을 설정하세요</p></div></div><form onSubmit={(event) => { event.preventDefault(); setSaved(true); }}><label>관심 게시판<select defaultValue="자유 게시판"><option>자유 게시판</option><option>게임 게시판</option><option>공략 게시판</option><option>질문 게시판</option></select></label><label className="checkLabel"><input type="checkbox" defaultChecked /> 인기글 알림 받기</label><label className="checkLabel"><input type="checkbox" defaultChecked /> 내 글의 댓글 알림 받기</label><button className="authSubmit">설정 저장</button>{saved && <p className="settingsSaved">설정이 저장되었습니다.</p>}</form></section></section><section className="myActivity"><h2>나의 활동</h2><div><strong>0</strong><span>작성한 글</span></div><div><strong>0</strong><span>받은 댓글</span></div><div><strong>0</strong><span>북마크</span></div></section></main></>;
}
function App() {
  const [activeView, setActiveViewState] = useState<View>(() => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get("view");
    if (view === "login" || view === "signup" || view === "mypage") return view;
    return params.get("board") === "free" ? "free" : "home";
  });
  const [member, setMember] = useState<Member | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light" || savedTheme === "dark") return savedTheme;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  const openFreeBoard = () => window.open(`${window.location.pathname}?board=free`, "_blank", "noopener,noreferrer");
  const toggleTheme = () => setTheme((current) => current === "dark" ? "light" : "dark");
  const setActiveView = (nextView: View) => {
    setActiveViewState(nextView);
    const query = nextView === "home" ? "" : nextView === "free" ? "?board=free" : `?view=${nextView}`;
    window.history.replaceState(null, "", `${window.location.pathname}${query}`);
  };
  const goHome = () => setActiveView("home");
  const goMyPage = () => member ? setActiveView("mypage") : setActiveView("login");
  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" }).catch(() => undefined);
    setMember(null);
    setActiveView("home");
  };

  useEffect(() => {
    let isActive = true;

    fetch("/api/auth/me", { credentials: "include" })
      .then((response) => response.ok ? response.json() : null)
      .then((currentMember: Member | null) => {
        if (isActive && currentMember) {
          setMember(currentMember);
        }
      })
      .catch(() => undefined)
      .then(() => {
        if (isActive) {
          setIsAuthReady(true);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, []);

  return <div className="app">{activeView === "free" && <FreeBoard onHome={goHome} theme={theme} onToggleTheme={toggleTheme} member={member} isAuthReady={isAuthReady} onLogin={() => setActiveView("login")} onSignup={() => setActiveView("signup")} onMyPage={goMyPage} onLogout={logout} />}{activeView === "home" && <Home onOpenFreeBoard={openFreeBoard} theme={theme} onToggleTheme={toggleTheme} member={member} isAuthReady={isAuthReady} onLogin={() => setActiveView("login")} onSignup={() => setActiveView("signup")} onMyPage={goMyPage} onLogout={logout} />}{activeView === "mypage" && member && <MyPage member={member} theme={theme} onToggleTheme={toggleTheme} onHome={goHome} onLogin={() => setActiveView("login")} onSignup={() => setActiveView("signup")} onMyPage={goMyPage} onLogout={logout} />}{activeView === "mypage" && !member && <AuthPage mode="login" theme={theme} onToggleTheme={toggleTheme} onHome={goHome} onModeChange={setActiveView} onSuccess={(nextMember) => { setMember(nextMember); setIsAuthReady(true); setActiveView("mypage"); }} />}{(activeView === "login" || activeView === "signup") && <AuthPage mode={activeView} theme={theme} onToggleTheme={toggleTheme} onHome={goHome} onModeChange={setActiveView} onSuccess={(nextMember) => { setMember(nextMember); setIsAuthReady(true); setActiveView("home"); }} />}<footer className="footer"><strong>INVEN COMMUNITY</strong><span>좋아하는 주제로 모이고 이야기하는 공간</span><span>© INVEN. All rights reserved.</span></footer></div>;
}

export default App;






