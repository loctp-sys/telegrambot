import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Offers from './pages/Offers';
import Content from './pages/Content';
import Config from './pages/Config';

// Root redirect component
function RootRedirect() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />;
}

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />

                    {/* Root redirect */}
                    <Route path="/" element={<RootRedirect />} />

                    {/* Protected Routes */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <Dashboard />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/offers"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <Offers />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/content"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <Content />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/scheduler"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <Content />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/config"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <Config />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
