import React, { useState } from 'react';
import './Login.css';
import logo from '../assets/logo.png';

const ForgotPassword = ({ setShowLogin }) => {
    const [email, setEmail] = useState('');
    const [errormsg, setErrormsg] = useState(null);
    const [successmsg, setSuccessmsg] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            setErrormsg('Email is required');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });
            const data = await response.json();
            if (data.error) {
                setErrormsg(data.error);
            } else {
                setSuccessmsg('Password recovery link has been sent to your email');
            }
        } catch (error) {
            console.error('Network error:', error);
            setErrormsg('A network error occurred. Please try again later.');
        }
    };

    return (
        <div className="loginPage">
            <div className="loginForm">
                <div className="text-center mb-4">
                    <img src={logo} alt="Logo" className="logo mb-3" />
                    <h2>Forgot Password</h2>
                </div>
                <form onSubmit={handleSubmit} className="d-flex flex-column">
                    <div className="form-group mb-3">
                        <input
                            type="email"
                            className="form-control"
                            placeholder="Enter your email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    {errormsg && <div className="text-danger mb-3">{errormsg}</div>}
                    {successmsg && <div className="text-success mb-3">{successmsg}</div>}
                    <div className="d-flex justify-content-center">
                        <button type="submit" className="btn btn-primary w-100">Send Recovery Link</button>
                    </div>
                    <div className="text-center mt-3">
                        <button type="button" onClick={setShowLogin} className="btn btn-link p-0">Back to Login</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
