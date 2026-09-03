import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import Header from "@/components/header";
import { dark } from "@clerk/themes";
import { ThemeProvider } from "@/components/theme-provider";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "MediVisit - Doctors Appointment Platform",
  description: "Connect with doctors anytime, anywhere",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
      }}
      localization={{
        // Blanks out the "(Optional)" hint next to First name / Last name.
        // This is a text-localization key, not a stylable element — hiding
        // it via `appearance.elements` (a different Clerk API) is a no-op.
        formFieldHintText__optional: "",
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="icon" href="icon.png" sizes="any" />
        </head>
        <body className={`${inter.className}`} suppressHydrationWarning>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <Header />
            <main className="min-h-screen">{children}</main>
            <Toaster richColors />
      
            <footer className="bg-muted/50 py-4">
              <div className="container mx-auto px-4 text-center text-gray-200">
                <p>Made by <Link className="text-emerald-300 hover:text-emerald-600" href="https://github.com/codewithahmedkhan">Ahmed Khan</Link>.</p>
              </div>
            </footer>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
