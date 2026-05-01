import './globals.css';
import { AuthProvider } from '../context/AuthContext';

export const metadata = {
  title: 'TaskFlow – Team Task Manager',
  description: 'Manage projects, assign tasks, and track progress with your team.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
