import { JWT_TOKEN_KEY, USER_KEY } from "@/utils/const";
import { EMAIL_VERIFIED_KEY } from "@/utils/const";
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

export const localStorageCleanup = () => {
  localStorage.clear();
};
