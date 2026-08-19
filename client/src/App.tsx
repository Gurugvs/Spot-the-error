import React, { Component, ErrorInfo, ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GameProvider } from './context/GameContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { OrganizerDashboard } from './pages/OrganizerDashboard';
import { CreateRoomPage } from './pages/CreateRoomPage';
import { RoomLobbyPage } from './pages/RoomLobbyPage';
import { LiveControlPanel } from './pages/LiveControlPanel';
import { PresentationMode } from './pages/PresentationMode';
import { OrganizerResultsPage } from './pages/OrganizerResultsPage';
import { QuestionManagementPage } from './pages/QuestionManagementPage';
import { PuzzleEditorPage } from './pages/PuzzleEditorPage';
import { ParticipantJoinPage } from './pages/ParticipantJoinPage';
import { ParticipantLobbyPage } from './pages/ParticipantLobbyPage';
import { ParticipantGamePage } from './pages/ParticipantGamePage';
import { ParticipantResultPage } from './pages/ParticipantResultPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Error Boundary to prevent blackouts
interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component tree:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-slate-100 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div className="space-y-2 max-w-md">
            <h1 className="text-2xl font-bold font-display text-white">Something went wrong</h1>
            <p className="text-xs text-slate-400">
              An unexpected error occurred. You can safely return to the homepage or reload the application.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = '/';
              }}
              className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-xs flex items-center gap-2 hover:bg-primary-hover transition-all"
            >
              <Home className="w-4 h-4" /> Go to Homepage
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-xl bg-surface-card border border-surface-border text-slate-300 font-bold text-xs flex items-center gap-2 hover:bg-surface-border transition-all"
            >
              <RefreshCw className="w-4 h-4" /> Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Protected Route for Organizer Pages
const ProtectedOrganizerRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500 text-xs">Checking authorization...</div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <GameProvider>
          <BrowserRouter>
            <div className="min-h-screen flex flex-col justify-between bg-background text-slate-100 font-sans selection:bg-primary selection:text-white">
              <Routes>
                {/* Projector Presentation Mode: Fullscreen standalone layout */}
                <Route path="/admin/room/:roomId/presentation" element={<PresentationMode />} />

                {/* Standard routes with Navbar & Footer */}
                <Route
                  path="*"
                  element={
                    <>
                      <Navbar />
                      <main className="flex-1 w-full">
                        <Routes>
                          <Route path="/" element={<LandingPage />} />
                          <Route path="/login" element={<LoginPage />} />
                          <Route path="/join" element={<ParticipantJoinPage />} />
                          <Route path="/participant/:roomCode" element={<ParticipantLobbyPage />} />
                          <Route path="/participant/game/:gameId" element={<ParticipantGamePage />} />
                          <Route path="/participant/result" element={<ParticipantResultPage />} />

                          {/* Organizer Admin Routes */}
                          <Route
                            path="/admin"
                            element={
                              <ProtectedOrganizerRoute>
                                <OrganizerDashboard />
                              </ProtectedOrganizerRoute>
                            }
                          />
                          <Route
                            path="/admin/create-room"
                            element={
                              <ProtectedOrganizerRoute>
                                <CreateRoomPage />
                              </ProtectedOrganizerRoute>
                            }
                          />
                          <Route
                            path="/admin/room/:roomCode"
                            element={
                              <ProtectedOrganizerRoute>
                                <RoomLobbyPage />
                              </ProtectedOrganizerRoute>
                            }
                          />
                          <Route
                            path="/admin/game/:gameId"
                            element={
                              <ProtectedOrganizerRoute>
                                <LiveControlPanel />
                              </ProtectedOrganizerRoute>
                            }
                          />
                          <Route
                            path="/admin/results/:gameId"
                            element={
                              <ProtectedOrganizerRoute>
                                <OrganizerResultsPage />
                              </ProtectedOrganizerRoute>
                            }
                          />
                          <Route
                            path="/admin/questions"
                            element={
                              <ProtectedOrganizerRoute>
                                <QuestionManagementPage />
                              </ProtectedOrganizerRoute>
                            }
                          />
                          <Route
                            path="/admin/questions/new"
                            element={
                              <ProtectedOrganizerRoute>
                                <PuzzleEditorPage />
                              </ProtectedOrganizerRoute>
                            }
                          />
                          <Route
                            path="/admin/questions/edit/:id"
                            element={
                              <ProtectedOrganizerRoute>
                                <PuzzleEditorPage />
                              </ProtectedOrganizerRoute>
                            }
                          />

                          {/* 404 Route */}
                          <Route path="*" element={<NotFoundPage />} />
                        </Routes>
                      </main>
                      <Footer />
                    </>
                  }
                />
              </Routes>
            </div>
          </BrowserRouter>
        </GameProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
