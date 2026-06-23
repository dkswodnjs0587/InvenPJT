import { useState } from "react";
import type { CSSProperties } from "react";
import "./App.css";

type Category = { id: number; title: string; icon: string; color: string; description: string };
type BoardPost = { no: number; title: string; author: string; date: string; views: number; likes: number; notice?: boolean; tag?: string };
type HomePost = { board: string; title: string; author: string; count: number; time: string };

const categories: Category[] = [
  { id: 1, title: "자유 게시판", icon: "💬", color: "#2563eb", description: "자유로운 이야기" },
  { id: 2, title: "게임 게시판", icon: "🎮", color: "#7c3aed", description: "게임 소식과 잡담" },
  { id: 3, title: "공략 게시판", icon: "📘", color: "#0891b2", description: "팁 · 공략 · 정보" },
  { id: 4, title: "질문 게시판", icon: "❔", color: "#ea580c", description: "질문과 답변" },
  { id: 5, title: "거래 게시판", icon: "🛒", color: "#16a34a", description: "아이템 · 계정 거래" },
  { id: 6, title: "스크린샷", icon: "🖼️", color: "#dc2626", description: "인증 · 자랑 · 기록" },
];

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
  { board: "자유 게시판", title: "오늘 업데이트 이후 체감 어떤가요?", author: "인벤러", count: 42, time: "12:48" },
  { board: "게임 게시판", title: "이번 주 이벤트 보상 정리해봤습니다", author: "겜잘알", count: 31, time: "12:15" },
  { board: "공략 게시판", title: "초보자가 먼저 챙기면 좋은 세팅 모음", author: "공략러", count: 28, time: "11:43" },
];

const homepageRecommendedPosts: HomePost[] = [
  { board: "공략 게시판", title: "자주 묻는 질문 한 번에 보기", author: "관리자", count: 16, time: "어제" },
  { board: "거래 게시판", title: "거래 전 꼭 확인해야 할 체크리스트", author: "안전거래", count: 14, time: "어제" },
  { board: "게임 게시판", title: "이번 시즌 주요 변경점 요약", author: "소식통", count: 12, time: "월요일" },
];

function Header({ onHome }: { onHome: () => void }) {
  return <header className="header"><button className="logo logoButton" onClick={onHome}><span className="logoBox">I</span><span>INVEN</span><small>COMMUNITY</small></button><form className="searchBox" onSubmit={(event) => event.preventDefault()}><input type="search" aria-label="게시판 검색" placeholder="게시판, 글, 유저를 검색해보세요" /><button aria-label="검색">⌕</button></form><div className="userActions"><button className="loginBtn">로그인</button><button className="joinBtn">회원가입</button></div></header>;
}

function FreeBoard({ onHome }: { onHome: () => void }) {
  return <><Header onHome={onHome} /><main className="main boardPage"><div className="breadcrumbs"><button onClick={onHome}>홈</button><span>›</span><span>자유 게시판</span></div><section className="boardHero"><div><span className="boardHeroIcon">💬</span><div><span className="eyebrow">FREE BOARD</span><h1>자유 게시판</h1><p>게임, 일상, 질문, 정보까지 자유롭게 이야기를 나누는 공간</p></div></div><button className="writeButton">✎ 글쓰기</button></section><section className="boardTabs"><button className="selected">전체</button><button>잡담</button><button>질문</button><button>정보</button><button>공략</button><button>인증</button></section><div className="boardLayout"><section className="boardTable"><div className="tableTools"><b>전체 글 <strong>3,812</strong></b><div><button className="sortSelected">최신순</button><button>추천순</button><button>조회순</button></div></div><div className="tableHead"><span>번호</span><span>제목</span><span>글쓴이</span><span>작성일</span><span>조회</span><span>추천</span></div>{freeBoardPosts.map((post) => <article className={`postRow ${post.notice ? "noticeRow" : ""}`} key={`${post.no}-${post.title}`}><span>{post.notice ? "공지" : post.no}</span><a href="#post">{post.tag && <em>{post.tag}</em>}{post.title}<small> [{post.likes}]</small></a><span>{post.author}</span><span>{post.date}</span><span>{post.views}</span><span>{post.likes}</span></article>)}<div className="pagination"><button>‹</button><button className="current">1</button><button>2</button><button>3</button><button>4</button><button>5</button><button>›</button></div></section><aside className="boardAside"><section><h2>자유 게시판 인기글</h2><ol><li>이번 시즌 주요 변경점 요약</li><li>복귀 유저를 위한 시작 가이드</li><li>오늘의 인기 스크린샷</li><li>초보자가 자주 묻는 질문</li><li>거래 전 확인할 체크리스트</li></ol></section><section className="asideNotice"><b>처음 오셨나요?</b><p>게시판 이용 수칙을 확인하고 즐겁게 참여해 주세요.</p><a href="#guide">이용 안내 보기 →</a></section></aside></div></main></>;
}

function Home({ onOpenFreeBoard }: { onOpenFreeBoard: () => void }) {
  return <><Header onHome={() => window.scrollTo({ top: 0, behavior: "smooth" })} /><main className="main" id="home"><section className="categorySection" aria-labelledby="category-title"><div className="sectionHeading"><div><span className="eyebrow">BOARD DIRECTORY</span><h2 id="category-title">모든 게시판</h2></div><span>관심 있는 커뮤니티를 찾아보세요</span></div><div className="categoryGrid">{categories.map((category) => <button className={`categoryCard ${category.id !== 1 ? "comingSoon" : ""}`} key={category.id} style={{ "--point-color": category.color } as CSSProperties} onClick={category.id === 1 ? onOpenFreeBoard : undefined}><span className="categoryIcon">{category.icon}</span><span><b>{category.title}</b><small>{category.id === 1 ? "새 탭에서 게시판 입장" : `${category.description} · 준비 중`}</small></span><i>{category.id === 1 ? "↗" : "·"}</i></button>)}</div></section><div className="contentGrid homeBoards"><section className="boardPanel hotPanel"><div className="panelHeading"><div><span className="hotDot">●</span><h2>핫 게시판</h2><p>지금 가장 활발한 이야기</p></div><button className="textButton" onClick={onOpenFreeBoard}>더보기 →</button></div><ul className="postList">{homepageHotPosts.map((post) => <li key={post.title}><span className="boardName">{post.board}</span><button className="postLink" onClick={post.board === "자유 게시판" ? onOpenFreeBoard : undefined}>{post.title}</button><span className="postMeta">{post.author} · <b>{post.count}</b> · {post.time}</span></li>)}</ul></section><aside className="sidePanels"><section className="boardPanel"><div className="panelHeading"><div><h2>추천 게시판</h2><p>놓치기 아쉬운 글</p></div><span>더보기 →</span></div><ul className="postList">{homepageRecommendedPosts.map((post) => <li key={post.title}><span className="boardName">{post.board}</span><span className="postLink">{post.title}</span></li>)}</ul></section><section className="notice"><span>📣</span><div><b>자유 게시판 오픈</b><p>첫 번째 게시판을 둘러보고 이야기를 나눠보세요.</p></div><button onClick={onOpenFreeBoard}>입장</button></section></aside></div><section className="boardPanel latestPanel"><div className="panelHeading"><div><h2>새로운 게시글</h2><p>방금 올라온 커뮤니티 이야기</p></div><div className="tabs"><button className="selected">전체</button><button>자유</button><button>질문</button><button>정보</button></div></div><ul className="postList">{[...homepageHotPosts, ...homepageRecommendedPosts.slice(0, 2)].map((post) => <li key={`latest-${post.title}`}><span className="boardName">{post.board}</span><span className="postLink">{post.title}</span><span className="postMeta">{post.author} · <b>{post.count}</b> · {post.time}</span></li>)}</ul></section></main></>;
}

function App() {
  const [activeBoard, setActiveBoard] = useState<"home" | "free">(() => new URLSearchParams(window.location.search).get("board") === "free" ? "free" : "home");
  const openFreeBoard = () => window.open(`${window.location.pathname}?board=free`, "_blank", "noopener,noreferrer");
  return <div className="app">{activeBoard === "free" ? <FreeBoard onHome={() => setActiveBoard("home")} /> : <Home onOpenFreeBoard={openFreeBoard} />}<footer className="footer"><strong>INVEN COMMUNITY</strong><span>좋아하는 주제로 모이고 이야기하는 공간</span><span>© INVEN. All rights reserved.</span></footer></div>;
}

export default App;
