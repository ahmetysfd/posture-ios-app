import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Onboarding from './screens/Onboarding';
import Home from './screens/Home';
import ProblemDetail from './screens/ProblemDetail';
import ExerciseFlow from './screens/ExerciseFlow';
import Completion from './screens/Completion';
import Progress from './screens/Progress';
import Settings from './screens/Settings';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/" element={<Home />} />
      <Route path="/problem/:id" element={<ProblemDetail />} />
      <Route path="/exercise/:problemId" element={<ExerciseFlow />} />
      <Route path="/completion/:problemId" element={<Completion />} />
      <Route path="/progress" element={<Progress />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  );
};

export default AppRoutes;
