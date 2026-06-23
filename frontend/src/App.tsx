import { useState } from "react";
import type { CSSProperties } from "react";
import "./App.css";

type Category = { id: number; title: string; icon: string; color: string; description: string };
type BoardPost = { no: number; title: string; author: string; date: string; views: number; likes: number; notice?: boolean; tag?: string };

const categories: Category[] = [
  { id: 1, title: "건담 / 로봇", icon: "🤖", color: "#2563eb", description: "건프라 · 로봇" },
  { id: 2, title: "밀리터리", icon: "🪖", color: "#4d7c0f", description: "전차 · 항공 · 역사" },
  { id: 3, title: "자동차", icon: "🏎️", color: "#dc2626", description: "카 모델 · 제작기" },
  { id: 4, title: "항공기", icon: "✈️", color: "#0284c7", description: "전투기 · 여객기" },
  { id: 5, title: "함선 / 선박", icon: "⚓", color: "#1d4ed8", description: "함선 · 해양" },
  { id: 6, title: "피규어", icon: "🧍", color: "#0891b2", description: "캐릭터 · 프라모델" },
];

const gundamPosts: BoardPost[] = [
  { no: 0, title: "[안내] 건담 / 로봇 게시판 이용 수칙", author: "운영자", date: "2026.06.23", views: 1240, likes: 16, notice: true },
  { no: 0, title: "[정보] 이번 달 건프라 신작 및 재판 일정", author: "모형뉴스", date: "2026.06.22", views: 890, likes: 42, notice: true },
  { no: 3812, title: "MG 사자비 버카 완성했습니다. 웨더링 조언 부탁드려요!", author: "프라소년", date: "12:48", views: 326, likes: 42, tag: "완성" },
  { no: 3811, title: "RG 뉴 건담에 잘 어울리는 액션베이스 추천", author: "건담러버", date: "12:31", views: 187, likes: 18, tag: "질문" },
  { no: 3810, title: "캘리번 메탈릭 도색 과정 공유합니다", author: "하비메이커", date: "11:54", views: 240, likes: 31, tag: "제작기" },
  { no: 3809, title: "구판 킷도 손보면 정말 멋져집니다", author: "오래된프라", date: "11:20", views: 155, likes: 22, tag: "잡담" },
  { no: 3808, title: "데칼 붙인 뒤 마감제는 무광이 좋을까요?", author: "초보빌더", date: "10:42", views: 128, likes: 9, tag: "질문" },
  { no: 3807, title: "이번 주 작업실 풍경입니다", author: "건프라데이", date: "09:57", views: 214, likes: 27, tag: "완성" },
];

const homepageHotPosts = [
  { board: "건담 / 로봇", title: "MG 사자비 버카 완성했습니다. 웨더링 조언 부탁드려요!", author: "프라소년", count: 42, time: "12:48" },
  { board: "피규어", title: "신작 예약 정보와 실물 사진을 한 번에 정리했습니다", author: "모형지기", count: 31, time: "12:15" },
  { board: "자동차", title: "클리어 코트 후 먼지 제거, 여러분은 어떻게 하시나요?", author: "카빌더", count: 19, time: "09:57" },
];

const homepageRecommendedPosts = [
  { board: "밀리터리", title: "현용 전차 도색에 잘 어울리는 컬러 조합", author: "스케일러", count: 16, time: "어제" },
  { board: "항공기", title: "F-14 톰캣 입문 키트 비교", author: "하늘모형", count: 14, time: "어제" },
  { board: "함선 / 선박", title: "함선 에칭 파츠 작업할 때 꼭 쓰는 도구", author: "바다모형", count: 12, time: "월요일" },
];

function Header({ onHome }: { onHome: () => void }) {
  return <header className="header"><button className="logo logoButton" onClick={onHome}><span className="logoBox">I</span><span>INVEN</span><small>MODEL</small></button><form className="searchBox" onSubmit={(event) => event.preventDefault()}><input type="search" aria-label="게시판 검색" placeholder="게시판, 작품, 키워드를 검색해보세요" /><button aria-label="검색">⌕</button></form><div className="userActions"><button className="loginBtn">로그인</button><button className="joinBtn">회원가입</button></div></header>;
}

function GundamBoard({ onHome }: { onHome: () => void }) {
  return <><Header onHome={onHome} /><main className="main boardPage"><div className="breadcrumbs"><button onClick={onHome}>홈</button><span>›</span><span>건담 / 로봇</span></div><section className="boardHero"><div><span className="boardHeroIcon">🤖</span><div><span className="eyebrow">GUNDAM & ROBOT</span><h1>건담 / 로봇 게시판</h1><p>건프라와 로봇 모델의 제작기, 정보, 자유로운 이야기를 나누는 공간</p></div></div><button className="writeButton">✎ 글쓰기</button></section><section className="boardTabs"><button className="selected">전체</button><button>완성작</button><button>제작기</button><button>질문</button><button>정보</button><button>자유</button></section><div className="boardLayout"><section className="boardTable"><div className="tableTools"><b>전체 글 <strong>3,812</strong></b><div><button className="sortSelected">최신순</button><button>추천순</button><button>조회순</button></div></div><div className="tableHead"><span>번호</span><span>제목</span><span>글쓴이</span><span>작성일</span><span>조회</span><span>추천</span></div>{gundamPosts.map((post) => <article className={`postRow ${post.notice ? "noticeRow" : ""}`} key={`${post.no}-${post.title}`}><span>{post.notice ? "공지" : post.no}</span><a href="#post">{post.tag && <em>{post.tag}</em>}{post.title}<small> [{post.likes}]</small></a><span>{post.author}</span><span>{post.date}</span><span>{post.views}</span><span>{post.likes}</span></article>)}<div className="pagination"><button>‹</button><button className="current">1</button><button>2</button><button>3</button><button>4</button><button>5</button><button>›</button></div></section><aside className="boardAside"><section><h2>건담 / 로봇 인기글</h2><ol><li>이번 달 신작 모아보기</li><li>도색 전 꼭 알아둘 팁</li><li>나만의 건프라 작업실</li><li>추천 공구 리스트</li><li>MG 킷 입문 추천</li></ol></section><section className="asideNotice"><b>처음 오셨나요?</b><p>게시판 이용 수칙을 확인하고 즐겁게 참여해 주세요.</p><a href="#guide">이용 안내 보기 →</a></section></aside></div></main></>;
}

function Home({ onOpenGundam }: { onOpenGundam: () => void }) {
  return <><Header onHome={() => window.scrollTo({ top: 0, behavior: "smooth" })} /><main className="main" id="home"><section className="categorySection" aria-labelledby="category-title"><div className="sectionHeading"><div><span className="eyebrow">BOARD DIRECTORY</span><h2 id="category-title">모든 게시판</h2></div><span>관심 있는 모델 이야기를 찾아보세요</span></div><div className="categoryGrid">{categories.map((category) => <button className={`categoryCard ${category.id !== 1 ? "comingSoon" : ""}`} key={category.id} style={{ "--point-color": category.color } as CSSProperties} onClick={category.id === 1 ? onOpenGundam : undefined}><span className="categoryIcon">{category.icon}</span><span><b>{category.title}</b><small>{category.id === 1 ? "새 탭에서 게시판 입장" : `${category.description} · 준비 중`}</small></span><i>{category.id === 1 ? "↗" : "·"}</i></button>)}</div></section><div className="contentGrid homeBoards"><section className="boardPanel hotPanel"><div className="panelHeading"><div><span className="hotDot">●</span><h2>핫 게시판</h2><p>지금 가장 활발한 이야기</p></div><button className="textButton" onClick={onOpenGundam}>더보기 →</button></div><ul className="postList">{homepageHotPosts.map((post) => <li key={post.title}><span className="boardName">{post.board}</span><button className="postLink" onClick={post.board === "건담 / 로봇" ? onOpenGundam : undefined}>{post.title}</button><span className="postMeta">{post.author} · <b>{post.count}</b> · {post.time}</span></li>)}</ul></section><aside className="sidePanels"><section className="boardPanel"><div className="panelHeading"><div><h2>추천 게시판</h2><p>놓치기 아쉬운 글</p></div><span>더보기 →</span></div><ul className="postList">{homepageRecommendedPosts.map((post) => <li key={post.title}><span className="boardName">{post.board}</span><span className="postLink">{post.title}</span></li>)}</ul></section><section className="notice"><span>📣</span><div><b>건담 / 로봇 게시판 오픈</b><p>첫 번째 게시판을 둘러보고 이야기를 나눠보세요.</p></div><button onClick={onOpenGundam}>입장</button></section></aside></div><section className="boardPanel latestPanel"><div className="panelHeading"><div><h2>새로운 게시글</h2><p>방금 올라온 모델 이야기</p></div><div className="tabs"><button className="selected">전체</button><button>제작기</button><button>질문</button><button>정보</button></div></div><ul className="postList">{[...homepageHotPosts, ...homepageRecommendedPosts.slice(0, 2)].map((post) => <li key={`latest-${post.title}`}><span className="boardName">{post.board}</span><span className="postLink">{post.title}</span><span className="postMeta">{post.author} · <b>{post.count}</b> · {post.time}</span></li>)}</ul></section></main></>;
}

function App() {
  const [activeBoard, setActiveBoard] = useState<"home" | "gundam">(() => new URLSearchParams(window.location.search).get("board") === "gundam" ? "gundam" : "home");
  const openGundam = () => window.open(`${window.location.pathname}?board=gundam`, "_blank", "noopener,noreferrer");
  return <div className="app">{activeBoard === "gundam" ? <GundamBoard onHome={() => setActiveBoard("home")} /> : <Home onOpenGundam={openGundam} />}<footer className="footer"><strong>INVEN MODEL</strong><span>좋아하는 모델, 함께 만들고 나누는 즐거움</span><span>© INVEN. All rights reserved.</span></footer></div>;
}

export default App;
