import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { AppHeader } from "@/components/app-header";
import { WorkspaceProvider } from "@/contexts/workspace";
import { ActionsProvider } from "@/contexts/actions";
import { ThemeProvider } from "next-themes";
import { CommandBar } from "@/components/command-bar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL("https://thebigstudio.in"),
  title: {
    default: "The Big Studio",
    template: "%s | The Big Studio",
  },
  description: "Making software accessible to everyone",
  applicationName: "The Big Studio",
  keywords: [
    "tools",
    "utilities",
    "networking",
    "security",
    "subnetting",
    "password generator",
    "base64",
  ],
  authors: [{ name: "The Big Studio", url: "https://thebigstudio.in" }],
  creator: "The Big Studio",
  publisher: "The Big Studio",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "The Big Studio",
    title: "The Big Studio",
    description: "Making software accessible to everyone",
    images: [
      {
        url: "/logo-new.png",
        width: 1200,
        height: 630,
        alt: "The Big Studio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Big Studio",
    description: "Making software accessible to everyone",
    images: ["/logo-new.png"],
    creator: "@thebigstudio",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SidebarProvider>
            <WorkspaceProvider>
              <ActionsProvider>
                <AppSidebar />
                <SidebarInset>
                  <AppHeader />
                  <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    {children}
                  </div>
                  <CommandBar />
                </SidebarInset>
              </ActionsProvider>
            </WorkspaceProvider>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
