import type { ListResponse, Post } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? ""; // same-origin by default

export async function fetchPosts(params: {
  q?: string;
  category?: string;
  source?: string;
  cursor?: string;
}) : Promise<ListResponse> {
  const usp = new URLSearchParams();
  if (params.q) usp.set("q", params.q);
  if (params.category) usp.set("category", params.category);
  if (params.source) usp.set("source", params.source);
  if (params.cursor) usp.set("cursor", params.cursor);

  const res = await fetch(`${API_BASE}/api/posts?${usp.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json();
}

export async function fetchPost(id: string): Promise<Post> {
  const res = await fetch(`${API_BASE}/api/posts/${encodeURIComponent(id)}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch post");
  return res.json();
}
