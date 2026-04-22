import './globals.css';
import { AuthProvider } from '@/lib/AuthContext';

export const metadata = {
  title: 'RestoTable - Restaurant Management System',
  description: 'Modern restaurant POS and management system with menu, orders, tables & QR, inventory, reports, and staff management.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
