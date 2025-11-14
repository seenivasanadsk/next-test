// app/layout.js
import "./globals.css";
import { Inter } from "next/font/google";
import { themeInitializerScript } from "../utils/themeScript";
import { ThemeProvider } from "../context/ThemeProvider";
import { NotificationProvider } from "@/context/NotificationProvider";
import { ActionHandlerProvider } from "@/context/ActionHandlerProvider";
import cn from "@/utils/cn";
import { ScreenProvider } from "@/context/ScreenProvider";

const inter = Inter({ subsets: ["latin"] });

const themeScript = themeInitializerScript();

export const metadata = {
  title: process.env.APP_NAME,
  description: process.env.APP_DESCRIPTION,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>

      <body className={cn(inter.className, "font-medium")}>
        <ScreenProvider>
          <ThemeProvider>
            <NotificationProvider>
              <ActionHandlerProvider>{children}</ActionHandlerProvider>
            </NotificationProvider>
          </ThemeProvider>
        </ScreenProvider>
      </body>
    </html>
  );
}
