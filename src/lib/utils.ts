import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind 클래스 병합 유틸 (shadcn/withwiz-ui 관례). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
