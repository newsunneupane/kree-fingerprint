import "./globals.css";

export const metadata = {
  title: "Kree Biometrics",
  description: "Biometric Attendance Dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}