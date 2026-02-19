export type SourceId = "sojoong" | "aicoss";

export type ListedItem = {
  remoteId: string;
  title: string;
  postedAt: string | null;
  url: string;
};

export type DetailedItem = ListedItem & {
  content: string | null;
  excerpt: string | null;
};

export type Env = {
  DB: D1Database;
  CRAWL_TIMEOUT_MS: string;
  USER_AGENT: string;
};
