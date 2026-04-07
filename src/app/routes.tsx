import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './screens/Home';
import Onboarding from './screens/Onboarding';
import OnboardingScreen from './screens/OnboardingScreen';
import ManualSelection from './screens/ManualSelection';
import ProblemDetail from './screens/ProblemDetail';
import ExerciseFlow from './screens/ExerciseFlow';
import Completion from './screens/Completion';
import Progress from './screens/Progress';
import Settings from './screens/Settings';
import BodyScanScreen from './screens/BodyScanScreen';
import PersonalizedProgramScreen from './screens/PersonalizedProgramScreen';
import DailyExerciseFlow from './screens/DailyExerciseFlow';
import { isOnboardingComplete } from './services/UserProfile';

/** Redirect to /onboarding if user hasn't completed onboarding */
const Guard: React.FC<{ children: React.ReactNode }> = ({ children }) =>
  isOnboardingComplete() ? <>{children}</> : <Navigate to="/onboarding" replace />;

const AppRoutes: React.FC = () => (
  <Routes>
    {/* ── Entry flow (ours) ─────────────────────────────────── */}
    <Route path="/onboarding" element={<Onboarding />} />
    <Route path="/onboarding-demographics" element={<OnboardingScreen />} />
    <Route path="/onboarding-manual" element={<ManualSelection />} />

    {/* ── Main app (GitHub system, guarded) ────────────────── */}
    <Route path="/" element={<Guard><Home /></Guard>} />
    <Route path="/problem/:id" element={<Guard><ProblemDetail /></Guard>} />
    <Route path="/exercise/:problemId" element={<Guard><ExerciseFlow /></Guard>} />
    <Route path="/completion/:problemId" element={<Guard><Completion /></Guard>} />
    <Route path="/progress" element={<Guard><Progress /></Guard>} />
    <Route path="/settings" element={<Guard><Settings /></Guard>} />
    <Route path="/scan" element={<Guard><BodyScanScreen /></Guard>} />
    <Route path="/scan/program" element={<Guard><PersonalizedProgramScreen /></Guard>} />
    <Route path="/daily-exercise" element={<Guard><DailyExerciseFlow /></Guard>} />
  </Routes>
);

export default AppRoutes;
