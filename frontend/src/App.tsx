import { Link, NavLink, Route, Routes } from 'react-router-dom';
import { LogIn, PencilLine, Search } from 'lucide-react';
import BoardPage from './pages/BoardPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import PostDetailPage from './pages/PostDetailPage';
import WritePage from './pages/WritePage';

function App() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <Link to="/" className="brand">InvenPJT</Link>
        <nav className="main-nav">
          <NavLink to="/boards/free">자유</NavLink>
          <NavLink to="/boards/guide">공략</NavLink>
          <NavLink to="/boards/qna">질문</NavLink>
        </nav>
        <div className="header-actions">
          <button className="icon-button" aria-label="검색">
            <Search size={18} />
          </button>
          <Link to="/write" className="button">
            <PencilLine size={16} />
            글쓰기
          </Link>
          <Link to="/login" className="button secondary">
            <LogIn size={16} />
            로그인
          </Link>
        </div>
      </header>

      <main className="site-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/boards/:boardSlug" element={<BoardPage />} />
          <Route path="/posts/:postId" element={<PostDetailPage />} />
          <Route path="/write" element={<WritePage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

