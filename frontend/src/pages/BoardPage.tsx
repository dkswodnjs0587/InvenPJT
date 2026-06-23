import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchPostsByBoard, Post } from '../api';
import { PostTable } from './HomePage';

const boardNames: Record<string, string> = {
  free: '자유 게시판',
  guide: '공략 게시판',
  qna: '질문 게시판',
};

function BoardPage() {
  const { boardSlug = 'free' } = useParams();
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetchPostsByBoard(boardSlug)
      .then(setPosts)
      .catch(() => setPosts([]));
  }, [boardSlug]);

  return (
    <section className="content-panel full">
      <div className="section-title">
        <div>
          <h1>{boardNames[boardSlug] ?? '게시판'}</h1>
          <p>팀 프로젝트의 기본 게시판 화면입니다.</p>
        </div>
        <Link to="/write" className="button">글쓰기</Link>
      </div>
      <PostTable posts={posts} emptyMessage="이 게시판에는 아직 글이 없습니다." />
    </section>
  );
}

export default BoardPage;

