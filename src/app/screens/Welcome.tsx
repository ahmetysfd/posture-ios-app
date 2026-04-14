import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { OnboardingFlow } from './Onboarding';

const Welcome: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Layout>
      <div
        style={{
          minHeight: 'calc(100vh - 94px)',
          height: 'calc(100vh - 94px)',
          background: '#0a0a0f',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <OnboardingFlow onFinish={() => navigate('/')} />
      </div>
    </Layout>
  );
};

export default Welcome;
