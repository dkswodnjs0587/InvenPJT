import "./App.css";

type Category = { id: number; title: string; icon: string; color: string; description: string };
type Post = { board: string; title: string; author: string; count: number; time: string; badge?: string };

const categories: Category[] = [
  { id: 1, title: "건담 / 로봇", icon: "🤖", color: "#2563eb", description: "건프라 · 로봇" },
  { id: 2, title: "밀리터리", icon: "🪖", color: "#4d7c0f", description: "전차 · 항공 · 역사" },
  { id: 3, title: "자동차", icon: "🏎️", color: "#dc2626", description: "카 모델 · 제작기" },
  { id: 4, title: "항공기", icon: "✈️", color: "#0284c7", description: "전투기 · 여객기" },
  { id: 5, title: "함선 / 선박", icon: "⚓", color: "#1d4ed8", description: "함선 · 해양" },
  { id: 6, title: "피규어", icon: "🧍", color: "#0891b2", description: "캐릭터 · 프라모델" },
];

const hotPosts: Post[] = [
  { board: "건담 / 로봇", title: "이번 주말에 완성한 MG 사자비입니다. 웨더링 조언 부탁드려요!", author: "프라소년", count: 42, time: "12:48", badge: "HOT" },
  { board: "피규어", title: "신작 예약 정보와 실물 사진을 한 번에 정리했습니다", author: "모형지기", count: 31, time: "12:15" },
  { board: "디오라마", title: "1/35 겨울 마을 베이스 제작 과정 공유합니다", author: "미니메이커", count: 28, time: "11:43" },
  { board: "지식 / 정보", title: "초보자를 위한 에어브러시 관리 체크리스트", author: "도구상자", count: 24, time: "10:32" },
  { board: "자동차", title: "클리어 코트 후 먼지 제거, 여러분은 어떻게 하시나요?", author: "카빌더", count: 19, time: "09:57" },
];

const recommended: Post[] = [
  { board: "밀리터리", title: "현용 전차 도색에 잘 어울리는 컬러 조합", author: "스케일러", count: 16, time: "어제" },
  { board: "항공기", title: "F-14 톰캣 입문 키트 비교", author: "하늘모형", count: 14, time: "어제" },
  { board: "함선 / 선박", title: "함선 에칭 파츠 작업할 때 꼭 쓰는 도구", author: "바다모형", count: 12, time: "월요일" },
];

function PostList({ posts }: { posts: Post[] }) {
  return <ul className="postList">{posts.map((post) => <li key={post.title}><span className="boardName">{post.board}</span><a href="#post">{post.badge && <em>{post.badge}</em>}{post.title}</a><span className="postMeta">{post.author} · <b>{post.count}</b> · {post.time}</span></li>)}</ul>;
}

function App() {
  return <div className="app">
    <header className="header">
      <a className="logo" href="#home"><span className="logoBox">I</span><span>INVEN</span><small>MODEL</small></a>
      <form className="searchBox"><input type="search" aria-label="게시판 검색" placeholder="게시판, 작품, 키워드를 검색해보세요" /><button type="submit" aria-label="검색">⌕</button></form>
      <div className="userActions"><button className="loginBtn">로그인</button><button className="joinBtn">회원가입</button></div>
    </header>
    <main className="main" id="home">
      <section className="categorySection" aria-labelledby="category-title"><div className="sectionHeading"><div><span className="eyebrow">BOARD DIRECTORY</span><h2 id="category-title">모든 게시판</h2></div><a href="#more">전체 보기 →</a></div><div className="categoryGrid">{categories.map((category) => <a className="categoryCard" href={`#board-${category.id}`} key={category.id} style={{ "--point-color": category.color } as React.CSSProperties}><span className="categoryIcon">{category.icon}</span><span><b>{category.title}</b><small>{category.description}</small></span><i>→</i></a>)}</div></section>
      <div className="contentGrid"><section className="boardPanel hotPanel"><div className="panelHeading"><div><span className="hotDot">●</span><h2>핫 게시판</h2><p>지금 가장 활발한 이야기</p></div><a href="#hot">더보기 →</a></div><PostList posts={hotPosts} /></section><aside className="sidePanels"><section className="boardPanel"><div className="panelHeading"><div><h2>추천 게시판</h2><p>놓치기 아쉬운 글</p></div><a href="#recommended">더보기 →</a></div><PostList posts={recommended} /></section><section className="notice"><span>📣</span><div><b>모델 커뮤니티 이용 안내</b><p>작품을 존중하는 즐거운 공간을 함께 만들어요.</p></div><a href="#notice">보기</a></section></aside></div>
      <section className="boardPanel latestPanel"><div className="panelHeading"><div><h2>새로운 게시글</h2><p>방금 올라온 모델 이야기</p></div><div className="tabs"><button className="selected">전체</button><button>제작기</button><button>질문</button><button>정보</button></div></div><PostList posts={[...hotPosts.slice(1, 4), ...recommended.slice(0, 2)]} /></section>
    </main><footer className="footer"><strong>INVEN MODEL</strong><span>좋아하는 모델, 함께 만들고 나누는 즐거움</span><span>© INVEN. All rights reserved.</span></footer>
  </div>;
}

export default App;
