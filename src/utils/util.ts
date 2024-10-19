import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const resetScrollPosition = (e: React.MouseEvent<HTMLDivElement>) => {
  const innerText = e.currentTarget.querySelector(".inner-text") as HTMLElement;
  if (innerText) {
    innerText.style.animation = "none";
    innerText.offsetHeight;
    innerText.style.animation = "";
  }
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
