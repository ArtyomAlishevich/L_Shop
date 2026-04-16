import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BasketProvider } from './context/BasketContext';
import { LocaleProvider } from './context/LocaleContext';
import { Header } from './components/common/Header';
import { HomePage } from './pages/HomePage';
import { GamesListPage } from './pages/GamesListPage';
import { GamePage } from './pages/GamesPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { BasketPage } from './pages/BasketPage';
import { DeliveryPage } from './pages/DeliveryPage';
import { TrackingPage } from './pages/TrackingPage';
import { AdminPage } from './pages/AdminPage';
import './App.css';

function App() {
    return (
        <BrowserRouter>
            <LocaleProvider>
                <AuthProvider>
                    <BasketProvider>
                        <div className="App">
                            <Header />
                            <main className="main-content">
                                <Routes>
                                    <Route path="/" element={<HomePage />} />
                                    <Route path="/games" element={<GamesListPage />} />
                                    <Route path="/game/:id" element={<GamePage />} />
                                    <Route path="/login" element={<LoginPage />} />
                                    <Route path="/register" element={<RegisterPage />} />
                                    <Route path="/basket" element={<BasketPage />} />
                                    <Route path="/delivery" element={<DeliveryPage />} />
                                    <Route path="/tracking/:orderId" element={<TrackingPage />} />
                                    <Route path="/admin" element={<AdminPage />} />
                                    <Route path="*" element={<Navigate to="/" />} />
                                </Routes>
                            </main>
                        </div>
                    </BasketProvider>
                </AuthProvider>
            </LocaleProvider>
        </BrowserRouter>
    );
}

export default App;
