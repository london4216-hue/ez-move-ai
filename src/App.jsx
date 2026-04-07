import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { pagesConfig } from './pages.config'
import PreviewHub from './pages/PreviewHub'
import Home from './pages/Home'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { PUBLIC_DEMO_MODE } from '@/lib/featureFlags';
import AgentOnboarding from './pages/AgentOnboarding';
import Preview from './pages/Preview';
import SuperAdmin from './pages/SuperAdmin';
import BrokerDashboard from './pages/BrokerDashboard';
import PrivacyPolicy from './pages/PrivacyPolicy';
import MyStuff from './pages/MyStuff';
import RoleRouter from './pages/RoleRouter';
import AgentDashboard from './pages/AgentDashboard';
import DemoFlow from './pages/DemoFlow';
import DemoLogin from './pages/DemoLogin';


import BuyerExperience from './pages/BuyerExperience';
import Marketplace from './pages/Marketplace';
import AccessExpired from './pages/AccessExpired';
import SellerExperience from './pages/SellerExperience';
import Register from './pages/Register';
import AddBox from './pages/AddBox';
import LabelPreview from './pages/LabelPreview';
import BoxDetail from './pages/BoxDetail';
import BoxInventory from './pages/BoxInventory';


const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors (skip in demo mode)
  if (authError && !PUBLIC_DEMO_MODE) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={<PreviewHub />} />
      <Route path="/register" element={PUBLIC_DEMO_MODE ? <PreviewHub /> : <Register />} />
      <Route path="/signup" element={PUBLIC_DEMO_MODE ? <PreviewHub /> : <Home />} />
      <Route path="/sign-up" element={PUBLIC_DEMO_MODE ? <PreviewHub /> : <Home />} />
      <Route path="/agent-signup" element={PUBLIC_DEMO_MODE ? <PreviewHub /> : <Home />} />
      <Route path="/broker-signup" element={PUBLIC_DEMO_MODE ? <PreviewHub /> : <Home />} />
      <Route path="/AgentDashboard" element={<AgentDashboard />} />
      <Route path="/Home" element={
        <LayoutWrapper currentPageName={mainPageKey}>
          <MainPage />
        </LayoutWrapper>
      } />
      {Object.entries(Pages).map(([path, Page]) => (
        <Route
          key={path}
          path={`/${path}`}
          element={
            <LayoutWrapper currentPageName={path}>
              <Page />
            </LayoutWrapper>
          }
        />
      ))}

      <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
      <Route path="/MyStuff" element={<MyStuff />} />
      <Route path="/Preview" element={<Preview />} />
      <Route path="/Demo" element={<DemoFlow />} />
      <Route path="/DemoLogin" element={<DemoLogin />} />

      <Route path="/BuyerExperience" element={<BuyerExperience />} />
      <Route path="/Marketplace" element={<Marketplace />} />
      <Route path="/AccessExpired" element={<AccessExpired />} />
      <Route path="/SellerExperience" element={<SellerExperience />} />
      <Route path="/AddBox" element={<AddBox />} />
      <Route path="/LabelPreview" element={<LabelPreview />} />
      <Route path="/box/:id" element={<BoxDetail />} />
      <Route path="/BoxInventory" element={<BoxInventory />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App