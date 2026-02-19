import type { DetailedItem, Env, ListedItem, SourceId } from "../types";

export type Source = {
  id: SourceId;
  label: string;
  list(env: Env): Promise<ListedItem[]>;
  detail(env: Env, item: ListedItem): Promise<DetailedItem>;
};
