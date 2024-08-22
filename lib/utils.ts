import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function shortenAddress(address: string) {
  if (address?.length < 13)
    return address;
  return `${address?.substring(0, 5)}...${address?.substring(address?.length - 4, address?.length)}`
}