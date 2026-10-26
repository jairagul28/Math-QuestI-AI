import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import MainLayout from './components/layout/MainLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TopicsPage from './pages/TopicsPage';
import TopicDetailPage from './pages/TopicDetailPage';
import QuizRunnerPage from './pages/QuizRunnerPage';
import NotFoundPage from './pages/NotFoundPage';
import GamificationFeedback from './components/common/GamificationFeedback';
import DailyChallengesPage from './pages/DailyChallengesPage';
import RewardsPage from './pages/RewardsPage';
import AvatarPickerPage from './pages/AvatarPickerPage';
import LeaderboardPage from './pages/LeaderboardPage';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <>
          <GamificationFeedback />
          <Router>
            <Routes>
              {/* Public & Informational Routes wrapped in MainLayout */}
              <Route element={<MainLayout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/topics" element={<TopicsPage />} />
                <Route path="/topics/:id" element={<TopicDetailPage />} />
                <Route
                  path="/topics/:id/quiz"
                  element={
                    <ProtectedRoute>
                      <QuizRunnerPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFoundPage />} />
              </Route>

              {/* Protected Student Dashboard Routes wrapped in DashboardLayout */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardPage />} />
                <Route path="challenges" element={<DailyChallengesPage />} />
                <Route path="rewards" element={<RewardsPage />} />
                <Route path="avatars" element={<AvatarPickerPage />} />
                <Route path="leaderboard" element={<LeaderboardPage />} />
              </Route>
            </Routes>
          </Router>
        </>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
