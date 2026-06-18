"use client";
import { Suspense } from "react";
import { Products } from "@/views/customer";

export default function Page() {
  return (
    <Suspense>
      <Products />
    </Suspense>
  );
}
