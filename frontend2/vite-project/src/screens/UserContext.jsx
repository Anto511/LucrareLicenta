import React, { createContext, useState, useContext } from 'react';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const login = async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:3000/signin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            console.log(data.user.subscribe)
            if (response.ok) {
                setUser({ name: data.user.name, email: data.user.email, token: data.token, wants_to_be_in_db: data.user.subscribe });
                setError(null);
            } else {
                throw new Error(data.error || 'Unknown error');
            }
        } catch (err) {
            setError(err.message || 'Network error');
            setUser(null);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
    };

    const register = async (name, email, password, dob) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:3000/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, dob })
            });

            const data = await response.json();
            console.log('Register response:', data);

            if (response.ok) {
                await login(email, password);
            } else {
                console.error('Register error:', data);
                setError(data.error);
            }
        } catch (err) {
            console.error('Network error:', err);
            setError('Network error');
        } finally {
            setLoading(false);
        }
    };

    const verify = async (userData, code) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:3000/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...userData, code })
            });

            const data = await response.json();

            if (response.ok) {
                setUser({ name: data.user.name, email: data.user.email, token: data.token, wants_to_be_in_db: data.user.subscribe });
                setError(null);
            } else {
                setError(data.error);
                setUser(null);
            }
        } catch (err) {
            setError('Network error');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <UserContext.Provider value={{ user, loading, error, login, logout, register, verify }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
