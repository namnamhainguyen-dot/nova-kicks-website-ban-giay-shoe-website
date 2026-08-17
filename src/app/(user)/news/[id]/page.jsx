"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function NewsDetailPage() {
  const params = useParams();
  const [article, setArticle] = useState(null);
  const [commentData, setCommentData] = useState({ name: "", content: "" });
  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState(0);

  useEffect(() => {
    fetch(`/api/news?id=${params.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setArticle(data.data);
          setLikes(data.data.likes || 0);
          setComments(data.data.comments || []);
        }
      });
  }, [params.id]);

  const handleLike = async () => {
    const res = await fetch(`/api/news?id=${params.id}`, {
      method: "PUT",
      body: JSON.stringify({ action: "like" })
    });
    const data = await res.json();
    if (data.success) setLikes(data.likes);
  };

  const submitComment = async (e) => {
    e.preventDefault();
    const res = await fetch(`/api/news?id=${params.id}`, {
      method: "PUT",
      body: JSON.stringify({ action: "comment", ...commentData })
    });
    const data = await res.json();
    if (data.success) {
      setComments([data.comment, ...comments]);
      setCommentData({ name: "", content: "" });
    }
  };

  if (!article) return <div>Loading...</div>;

  return (
    <div className="container py-5">
      <h1>{article.title}</h1>
      <button onClick={handleLike} className="btn btn-outline-danger">❤️ {likes} Like</button>
      
      {/* Nơi hiển thị nội dung */}
      <div dangerouslySetInnerHTML={{ __html: article.content }} className="mt-4" />

      {/* Form Comment */}
      <hr className="my-5"/>
      <h3>Bình luận ({comments.length})</h3>
      <form onSubmit={submitComment} className="mb-4">
        <input className="form-control mb-2" placeholder="Tên của bạn" value={commentData.name} onChange={e => setCommentData({...commentData, name: e.target.value})} required />
        <textarea className="form-control mb-2" placeholder="Nội dung" value={commentData.content} onChange={e => setCommentData({...commentData, content: e.target.value})} required />
        <button className="btn btn-primary">Gửi</button>
      </form>

      {/* List Comment */}
      {comments.map(c => (
        <div key={c._id} className="card p-3 mb-2">
          <strong>{c.name}</strong>
          <p>{c.content}</p>
          <small className="text-muted">{new Date(c.createdAt).toLocaleDateString()}</small>
        </div>
      ))}
    </div>
  );
}