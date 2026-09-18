"use client";

import { Suspense } from "react";
import RouteLoader from "@/components/RouteLoader";

export default function RouteLoaderHost() {
  return (
    <Suspense fallback={null}>
      <RouteLoader />
    </Suspense>
  );
}
