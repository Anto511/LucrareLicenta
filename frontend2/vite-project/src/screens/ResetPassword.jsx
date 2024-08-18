import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ResetPassword.css';
import logo from '../assets/logo.png';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errormsg, setErrormsg] = useState(null);
    const [successmsg, setSuccessmsg] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token || !newPassword || !confirmPassword) {
            setErrormsg('All fields are required');
            return;
        }

        if (newPassword !== confirmPassword) {
            setErrormsg('Passwords do not match');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token, newPassword })
            });
            const data = await response.json();
            if (data.error) {
                setErrormsg(data.error);
            } else {
                setSuccessmsg('Password has been reset successfully');
                setTimeout(() => navigate('/'), 3000);
            }
        } catch (error) {
            setErrormsg('A network error occurred. Please try again later.');
        }
    };

    const handleBackToLogin = () => {
        navigate('/');
    };

    return (
        <div className="loginPageResetP">
            <div className="loginFormResetP">
                <div className="text-center mb-4">
                    <img src={logo} alt="Logo" className="logo mb-3" />
                    <h2>Reset Password</h2>
                </div>
                <form onSubmit={handleSubmit} className="d-flex flex-column">
                    <div className="form-group mb-3">
                        <input
                            type="password"
                            className="form-control"
                            placeholder="Enter new password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>
                    <div className="form-group mb-3">
                        <input
                            type="password"
                            className="form-control"
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                    {errormsg && <div className="text-danger mb-3">{errormsg}</div>}
                    {successmsg && <div className="text-success mb-3">{successmsg}</div>}
                    <div className="d-flex justify-content-center">
                        <button type="submit" className="btn btn-primary">Reset Password</button>
                    </div>
                    <div className="text-center mt-3">
                        <button type="button" onClick={handleBackToLogin} className="btn btn-link">Back to Login</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
