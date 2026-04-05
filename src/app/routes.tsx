import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './screens/Home';
import ProblemDetail from './screens/ProblemDetail';
import ExerciseFlow from './screens/ExerciseFlow';
import Completion from './screens/Completion';
import Progress from './screens/Progress';
import Settings from './screens/Settings';
import BodyScanScreen from './screens/BodyScanScreen';
import PersonalizedProgramScreen from './screens/PersonalizedProgramScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import { isOnboardingComplete } from './services/UserProfile';

/** Redirect to onboarding if user hasn't completed it */
const RequireOnboarding: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!isOnboardingComplete()) {
    return <Navigate to="/onboarding" replace />;
  }
  return <>{children}</>;
};

const AppRoutes: React.FC = () => (
  <Routes>
    <Route path="/onboarding" element={<OnboardingScreen />} />

    <Route path="/" element={<RequireOnboarding><Home /></RequireOnboarding>} />
    <Route path="/problem/:id" element={<RequireOnboarding><ProblemDetail /></RequireOnboarding>} />
    <Route path="/exercise/:problemId" element={<RequireOnboarding><ExerciseFlow /></RequireOnboarding>} />
    <Route path="/completion/:problemId" element={<RequireOnboarding><Completion /></RequireOnboarding>} />
    <Route path="/progress" element={<RequireOnboarding><Progress /></RequireOnboarding>} />
    <Route path="/settings" element={<RequireOnboarding><Settings /></RequireOnboarding>} />
    <Route path="/scan" element={<RequireOnboarding><BodyScanScreen /></RequireOnboarding>} />
    <Route path="/scan/program" element={<RequireOnboarding><PersonalizedProgramScreen /></RequireOnboarding>} />
  </Routes>
);

export default AppRoutes;
