export type Category = "행사" | "모집" | "안내" | "기타";

export type Post = {
  id: string;
  source: "sojoong" | "aicoss";
  remote_id: string;
  title: string;
  posted_at: string | null;
  url: string;
  excerpt: string | null;
  content: string | null;
  category: Category;
  updated_at: string;
};

export type ListResponse = {
  items: Post[];
  nextCursor: string | null;
};
