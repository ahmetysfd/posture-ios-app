import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './screens/Home';
import ProblemDetail from './screens/ProblemDetail';
import ExerciseFlow from './screens/ExerciseFlow';
import Completion from './screens/Completion';
import Progress from './screens/Progress';
import Settings from './screens/Settings';
import BodyScanScreen from './screens/BodyScanScreen';
import AnalysisResultScreen from './screens/AnalysisResultScreen';
import PersonalizedProgramScreen from './screens/PersonalizedProgramScreen';

const AppRoutes: React.FC = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/problem/:id" element={<ProblemDetail />} />
    <Route path="/exercise/:problemId" element={<ExerciseFlow />} />
    <Route path="/completion/:problemId" element={<Completion />} />
    <Route path="/progress" element={<Progress />} />
    <Route path="/settings" element={<Settings />} />
    <Route path="/scan" element={<BodyScanScreen />} />
    <Route path="/scan/results" element={<AnalysisResultScreen />} />
    <Route path="/scan/program" element={<PersonalizedProgramScreen />} />
  </Routes>
);

export default AppRoutes;
