import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Board, fetchBoards, fetchLatestPosts, Post } from '../api';

function HomePage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    Promise.all([fetchBoards(), fetchLatestPosts()])
      .then(([boardResult, postResult]) => {
        setBoards(boardResult);
        setPosts(postResult);
      })
      .catch(() => {
        setBoards(defaultBoards);
        setPosts([]);
      });
  }, []);

  return (
    <div className="page-grid">
      <section className="content-panel">
        <div className="section-title">
          <h1>최신 글</h1>
          <Link to="/write">글쓰기</Link>
        </div>
        <PostTable posts={posts} emptyMessage="아직 등록된 글이 없습니다." />
      </section>

      <aside className="side-panel">
        <h2>게시판</h2>
        <div className="board-list">
          {(boards.length > 0 ? boards : defaultBoards).map((board) => (
            <Link key={board.slug} to={`/boards/${board.slug}`} className="board-item">
              <strong>{board.name}</strong>
              <span>{board.description}</span>
            </Link>
          ))}
        </div>
      </aside>
    </div>
  );
}

export function PostTable({ posts, emptyMessage }: { posts: Post[]; emptyMessage: string }) {
  if (posts.length === 0) {
    return <div className="empty-state">{emptyMessage}</div>;
  }

  return (
    <div className="post-table">
      {posts.map((post) => (
        <Link key={post.id} to={`/posts/${post.id}`} className="post-row">
          <span className="post-board">{post.boardName}</span>
          <strong>{post.title}</strong>
          <span>{post.authorName}</span>
          <span>조회 {post.viewCount}</span>
        </Link>
      ))}
    </div>
  );
}

const defaultBoards: Board[] = [
  { id: 1, name: '자유 게시판', slug: 'free', description: '자유롭게 이야기를 나누는 공간' },
  { id: 2, name: '공략 게시판', slug: 'guide', description: '팁과 공략을 정리하는 공간' },
  { id: 3, name: '질문 게시판', slug: 'qna', description: '궁금한 점을 묻고 답하는 공간' },
];

export default HomePage;

