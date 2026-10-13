import "./globals.css";

export const metadata = {
  title: "Ringkasan Transportasi | Rute Maba",
  description: "Dashboard operasional untuk Jemput Day 1, Antar Day 2, dan Jemput Day 2.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
