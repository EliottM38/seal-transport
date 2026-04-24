export const metadata = {
  icons: {
    icon: "https://seal.transport-manager.net/IsereSKI/wp-content/uploads/sites/549/2025/10/cropped-cropped-telechargement.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
