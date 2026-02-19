import type { Source } from "./base";
import { sojoongSource } from "./sojoong";
import { aicossSource } from "./aicoss";

export const SOURCES: Source[] = [sojoongSource, aicossSource];
