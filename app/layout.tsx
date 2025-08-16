import type { Metadata } from "next";

import "./globals.css";
import { Providers } from "./providers";
import { APP_NAME, APP_DESCRIPTION } from "../lib/constants";
import { ToastProvider } from "../contexts/toastContext";
import { ToastContainer } from "../components/toastContainer";
import { getMiniAppEmbedMetadata } from "@/lib/utils";

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
  openGraph: {
    title: APP_NAME,
    description: APP_DESCRIPTION,
  },
  other: {
    "fc:frame": JSON.stringify(getMiniAppEmbedMetadata()),
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <ToastProvider>
            {children}
            <ToastContainer />
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}
