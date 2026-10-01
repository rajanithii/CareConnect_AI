import { BrowserRouter } from 'react-router-dom';
import Providers from './providers';
import AppRoutes from '../routes/AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <Providers>
        <AppRoutes />
      </Providers>
    </BrowserRouter>
  );
}
