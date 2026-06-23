import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchPost, Post } from '../api';

function PostDetailPage() {
  const { postId = '' } = useParams();
  const [post, setPost] = useState<Post | null>(null);

  useEffect(() => {
    fetchPost(postId)
      .then(setPost)
      .catch(() => setPost(null));
  }, [postId]);

  if (!post) {
    return (
      <section className="content-panel full">
        <div className="empty-state">글을 불러오지 못했습니다.</div>
      </section>
    );
  }

  return (
    <article className="content-panel full">
      <div className="post-detail-header">
        <Link to={`/boards/${post.boardSlug}`}>{post.boardName}</Link>
        <h1>{post.title}</h1>
        <div className="post-meta">
          <span>{post.authorName}</span>
          <span>조회 {post.viewCount}</span>
        </div>
      </div>
      <div className="post-content">{post.content}</div>
    </article>
  );
}

export default PostDetailPage;

