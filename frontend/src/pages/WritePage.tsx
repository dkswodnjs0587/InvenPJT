function WritePage() {
  return (
    <section className="content-panel full">
      <div className="section-title">
        <h1>글쓰기</h1>
      </div>
      <form className="write-form">
        <label>
          게시판
          <select defaultValue="free">
            <option value="free">자유 게시판</option>
            <option value="guide">공략 게시판</option>
            <option value="qna">질문 게시판</option>
          </select>
        </label>
        <label>
          제목
          <input type="text" placeholder="제목을 입력하세요" />
        </label>
        <label>
          내용
          <textarea placeholder="내용을 입력하세요" rows={12} />
        </label>
        <button className="button" type="button">등록</button>
      </form>
    </section>
  );
}

export default WritePage;

