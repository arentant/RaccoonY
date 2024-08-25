import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function shortenAddress(address: string) {
  if (address?.length < 13)
    return address;
  return `${address?.substring(0, 5)}...${address?.substring(address?.length - 4, address?.length)}`
}

export const formatAmount = (unformattedAmount: bigint | unknown, decimals: number) => {
  return (Number(BigInt(unformattedAmount?.toString() || 0)) / Math.pow(10, decimals))
}

export const haveOwner = (owner: string) => {
  const haveOwner = owner && owner?.toLowerCase() !== '0x0000000000000000000000000000000000000000'
  return haveOwner
}

// zuyg
export function isEven(n: number) {
  return n % 2 == 0;
}

// kent
export function isOdd(n: number) {
  return Math.abs(n % 2) == 1;
}