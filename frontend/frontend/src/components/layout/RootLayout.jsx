// app/layout.js
import "./global.css";
import { AuthProvider } from "@/src/contexts/AuthContext";

export const metadata = {
  title: "Planning Map - Planification d'Itinéraires Intelligente",
  description: "Planifiez vos voyages avec des points d'intérêt stratégiques au Cameroun",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className="antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}