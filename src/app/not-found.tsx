"use client";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-muted-foreground">পেজটি পাওয়া যায়নি</p>
      <Link href="/" className="text-accent hover:underline">
        হোমে ফিরে যান
      </Link>
    </div>
  );
}
