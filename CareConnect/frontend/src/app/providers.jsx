import { AuthProvider } from '../contexts/AuthContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { HospitalProvider } from '../contexts/HospitalContext';

export default function Providers({ children }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <HospitalProvider>{children}</HospitalProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
