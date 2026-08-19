import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GameProvider } from './context/GameContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

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

// Protected Route for Organizer Pages
const ProtectedOrganizerRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Checking authorization...</div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export const App: React.FC = () => {
  return (
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
  );
};

export default App;
