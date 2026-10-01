import { Routes, Route } from 'react-router-dom';

import Home from '../pages/Landing/Home';
import About from '../pages/Landing/About';
import Features from '../pages/Landing/Features';
import Contact from '../pages/Landing/Contact';
import FAQPage from '../pages/Landing/FAQ';
import PrivacyPolicy from '../pages/Landing/PrivacyPolicy';

import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import HospitalLogin from '../pages/Auth/HospitalLogin';
import HospitalRegister from '../pages/Auth/HospitalRegister';
import ForgotPassword from '../pages/Auth/ForgotPassword';
import ResetPassword from '../pages/Auth/ResetPassword';

import HospitalDashboard from '../pages/Hospital/Dashboard';
import CreateRequest from '../pages/Hospital/CreateRequest';
import RequestDetails from '../pages/Hospital/RequestDetails';
import AIProcessing from '../pages/Hospital/AIProcessing';
import MatchingResults from '../pages/Hospital/MatchingResults';
import RequestView from '../pages/Hospital/RequestView';
import LiveTracking from '../pages/Hospital/LiveTracking';
import HospitalAnalytics from '../pages/Hospital/Analytics';
import BloodBank from '../pages/Hospital/BloodBank';
import BloodBankAddUnit from '../pages/Hospital/BloodBankAddUnit';
import BloodBankUnitDetail from '../pages/Hospital/BloodBankUnitDetail';
import BloodBankAnalytics from '../pages/Hospital/BloodBankAnalytics';
import BloodBankForecasting from '../pages/Hospital/BloodBankForecasting';
import PeakPatternsAnalysis from '../pages/Hospital/PeakPatternsAnalysis';
import HospitalSettings from '../pages/Hospital/Settings';
import HospitalProfile from '../pages/Hospital/Profile';
import BloodShortagePrediction from '../pages/Hospital/BloodShortagePrediction';
import RecommendationEngine from '../pages/Hospital/RecommendationEngine';
import InterHospitalExchange from '../pages/Hospital/InterHospitalExchange';
import BloodExpiryManagement from '../pages/Hospital/BloodExpiryManagement';

import DonorDashboard from '../pages/Donor/Dashboard';
import DonorNotifications from '../pages/Donor/Notifications';
import DonationHistory from '../pages/Donor/DonationHistory';
import NearbyRequests from '../pages/Donor/NearbyRequests';
import DonorProfile from '../pages/Donor/Profile';
import DonorSettings from '../pages/Donor/Settings';

import NotificationCenter from '../pages/Notifications/NotificationCenter';
import EmergencyAlerts from '../pages/Notifications/EmergencyAlerts';
import NotificationHistory from '../pages/Notifications/History';

import AIInsights from '../pages/AI/AIInsights';
import Predictions from '../pages/AI/Predictions';

import AdminDashboard from '../pages/Admin/Dashboard';
import AdminHospitals from '../pages/Admin/Hospitals';
import AdminDonors from '../pages/Admin/Donors';
import AdminRequests from '../pages/Admin/Requests';
import AdminReports from '../pages/Admin/Reports';
import AdminSettings from '../pages/Admin/Settings';
import AdvancedAdminDashboard from '../pages/Admin/AdminDashboard';

import NotFound from '../pages/NotFound';
import Unauthorized from '../pages/Unauthorized';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Landing */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/features" element={<Features />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/faq" element={<FAQPage />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />

      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/hospital/login" element={<HospitalLogin />} />
      <Route path="/hospital/register" element={<HospitalRegister />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      {/* Hospital portal */}
      <Route path="/hospital/dashboard" element={<HospitalDashboard />} />
      <Route path="/hospital/create-request" element={<CreateRequest />} />
      <Route path="/hospital/requests" element={<RequestDetails />} />
      <Route path="/hospital/ai-processing" element={<AIProcessing />} />
      <Route path="/hospital/matching-results" element={<MatchingResults />} />
      <Route path="/hospital/matching-results/:requestId" element={<MatchingResults />} />
      <Route path="/hospital/requests/:id" element={<RequestView />} />
      <Route path="/hospital/live-tracking" element={<LiveTracking />} />
      <Route path="/hospital/analytics" element={<HospitalAnalytics />} />
      <Route path="/hospital/blood-bank" element={<BloodBank />} />
      <Route path="/hospital/blood-bank/add" element={<BloodBankAddUnit />} />
      <Route path="/hospital/blood-bank/units/:id" element={<BloodBankUnitDetail />} />
      <Route path="/hospital/blood-bank/analytics" element={<BloodBankAnalytics />} />
      <Route path="/hospital/forecasting" element={<BloodBankForecasting />} />
      <Route path="/hospital/forecasting/peaks" element={<PeakPatternsAnalysis />} />
      <Route path="/hospital/settings" element={<HospitalSettings />} />
      <Route path="/hospital/profile" element={<HospitalProfile />} />
      <Route path="/hospital/shortage-prediction" element={<BloodShortagePrediction />} />
      <Route path="/hospital/recommendations" element={<RecommendationEngine />} />
      <Route path="/hospital/inter-hospital-exchange" element={<InterHospitalExchange />} />
      <Route path="/hospital/blood-expiry" element={<BloodExpiryManagement />} />

      {/* Donor portal */}
      <Route path="/donor/dashboard" element={<DonorDashboard />} />
      <Route path="/donor/notifications" element={<DonorNotifications />} />
      <Route path="/donor/history" element={<DonationHistory />} />
      <Route path="/donor/nearby" element={<NearbyRequests />} />
      <Route path="/donor/profile" element={<DonorProfile />} />
      <Route path="/donor/settings" element={<DonorSettings />} />

      {/* Notifications */}
      <Route path="/notifications" element={<NotificationCenter />} />
      <Route path="/notifications/emergency" element={<EmergencyAlerts />} />
      <Route path="/notifications/history" element={<NotificationHistory />} />

      {/* AI module */}
      <Route path="/ai/insights" element={<AIInsights />} />
      <Route path="/ai/predictions" element={<Predictions />} />

      {/* Admin */}
      <Route path="/admin/dashboard" element={<AdvancedAdminDashboard />} />
      <Route path="/admin/hospitals" element={<AdminHospitals />} />
      <Route path="/admin/donors" element={<AdminDonors />} />
      <Route path="/admin/requests" element={<AdminRequests />} />
      <Route path="/admin/reports" element={<AdminReports />} />
      <Route path="/admin/settings" element={<AdminSettings />} />

      {/* Fallbacks */}
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
