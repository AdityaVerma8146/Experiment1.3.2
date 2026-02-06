import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';

// --- 1. ROUTE GUARD COMPONENT ---
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" />;
};

// --- 2. LOGIN PAGE ---
const Login = () => {
    const [email, setEmail] = useState('user@test.com');
    const [password, setPassword] = useState('password123');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/login', { email, password });
            localStorage.setItem('token', res.data.token); // Store JWT
            navigate('/dashboard');
        } catch (err) {
            alert("Login Failed!");
        }
    };

    return (
        <div className="p-10 text-center">
            <h2 className="text-2xl mb-4">Login</h2>
            <form onSubmit={handleLogin} className="flex flex-col w-64 mx-auto gap-3">
                <input className="border p-2" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                <input className="border p-2" type="password" value={password} onChange={e => setPassword(e.target.value)} />
                <button className="bg-blue-500 text-white p-2 rounded">Login</button>
            </form>
        </div>
    );
};

// --- 3. DASHBOARD (PROTECTED) ---
const Dashboard = () => {
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/dashboard-data', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessage(res.data.data);
            } catch (err) {
                localStorage.removeItem('token');
                navigate('/login');
            }
        };
        fetchData();
    }, [navigate]);

    return (
        <div className="p-10 text-center">
            <h2 className="text-2xl mb-4">Dashboard</h2>
            <p className="bg-green-100 p-4">{message || "Loading protected data..."}</p>
            <button onClick={() => { localStorage.removeItem('token'); navigate('/login'); }} 
                    className="mt-4 text-red-500 underline">Logout</button>
        </div>
    );
};

// --- 4. MAIN APP WITH ROUTES ---
export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                } />
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </BrowserRouter>
    );
}