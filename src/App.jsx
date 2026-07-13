import { Routes, Route } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
import RequireAuth from "./components/apply/RequireAuth";
import RequirePhone from "./components/apply/RequirePhone";
import MainPage from "./pages/MainPage";
import ApplyPage from "./pages/ApplyPage";
import CallbackPage from "./pages/CallbackPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ForgotPage from "./pages/ForgotPage";
import ResetPage from "./pages/ResetPage";
import OnboardingPage from "./pages/OnboardingPage";
import TeamPage from "./pages/TeamPage";
import ProfilePage from "./pages/ProfilePage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/auth/callback" element={<CallbackPage />} />
      <Route path="/auth/google/callback" element={<CallbackPage />} />
      <Route path="/apply" element={<ApplyPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot" element={<ForgotPage />} />
      <Route path="/reset" element={<ResetPage />} />
      <Route element={<RequireAuth />}>
        <Route path="/profile" element={<ProfilePage />} />
        <Route element={<RequirePhone />}>
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/team" element={<TeamPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
