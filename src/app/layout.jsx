import "./globals.css";

export const metadata = {
  title: "Fingerprint Attendance",
  description: "Biometric Attendance Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  );
}
