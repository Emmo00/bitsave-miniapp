"use client";

import dynamic from "next/dynamic";
import { MiniAppProvider } from "@neynar/react";
import { ANALYTICS_ENABLED } from "../lib/constants";

const WagmiProvider = dynamic(() => import("../components/providers/WagmiProvider"), {
  ssr: false,
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider>
      <MiniAppProvider analyticsEnabled={ANALYTICS_ENABLED} backButtonEnabled={true}>
        {children}
      </MiniAppProvider>
    </WagmiProvider>
  );
}
