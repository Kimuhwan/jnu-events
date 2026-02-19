import { use } from "react";
import { PostDetail } from "./post-detail";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <PostDetail id={id} />;
}
