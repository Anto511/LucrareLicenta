import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import './Login.css';
import logo from '../assets/logo.png';

const Verification = ({ verificationData, onVerificationSuccess, setShowSignup }) => {
    const navigate = useNavigate();
    const { verify, login } = useUser();
    const [userdata, setUserdata] = useState(null);
    const [errormsg, setErrormsg] = useState(null);
    const [successmsg, setSuccessmsg] = useState(null);
    const [userCode, setUserCode] = useState('');
    const [actualCode, setActualCode] = useState('');
    const [timeLeft, setTimeLeft] = useState(120);
    const [resendTimer, setResendTimer] = useState(30);

    useEffect(() => {
        if (!verificationData || !verificationData.data || !verificationData.VerificationCode) {
            setErrormsg('Invalid access or data not found.');
            return;
        }
        setUserdata(verificationData.data);
        setActualCode(verificationData.VerificationCode);
    }, [verificationData]);

    useEffect(() => {
        if (timeLeft <= 0) {
            window.location.reload();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prevTime => prevTime - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    useEffect(() => {
        if (resendTimer <= 0) {
            return;
        }

        const timer = setInterval(() => {
            setResendTimer(prevTime => prevTime - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [resendTimer]);

    const Sendtobackend = async () => {
        const cleanedUserCode = userCode.trim();
        const cleanedActualCode = String(actualCode).trim();

        if (!userdata) {
            setErrormsg('No user data to send. Please restart the process.');
            return;
        }

        if (cleanedUserCode === '') {
            setErrormsg('Please enter the code');
            return;
        } else if (cleanedUserCode === cleanedActualCode) {
            console.log('Correct code');
            try {
                await verify(userdata, cleanedUserCode);
                await login(userdata.email, userdata.password);
                onVerificationSuccess();
                navigate('/');
            } catch (error) {
                console.error('Verification error:', error);
                setErrormsg('Failed to verify the code, please try again');
            }
        } else {
            setErrormsg('Incorrect code');
            console.error('Mismatch in codes entered:', { user: cleanedUserCode, actual: cleanedActualCode });
        }
    };

    const handleBackToSignup = () => {
        const updatedData = { ...userdata, password: '', cpassword: '' };
        setShowSignup(updatedData);
    };

    const handleResendCode = async () => {
        try {
            const response = await fetch('http://localhost:3000/resend-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: userdata.email })
            });

            const data = await response.json();

            if (data.error) {
                setErrormsg(data.error);
            } else {
                alert('Verification code resent successfully.');
                setActualCode(data.VerificationCode);
                setResendTimer(30);
            }
        } catch (error) {
            setErrormsg('Failed to resend verification code. Please try again.');
        }
    };

    return (
        <div className="loginPage">
            <div className="loginForm">
                <div className="text-center mb-4">
                    <img src={logo} alt="Logo" className="logo mb-3" />
                    <h2>Verification</h2>
                </div>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    Sendtobackend();
                }} className="d-flex flex-column">
                    <div className="form-group mb-5">
                        <input
                            type="text"
                            value={userCode}
                            className="form-control"
                            id="verificationCode"
                            placeholder="Enter code"
                            onChange={(e) => setUserCode(e.target.value)}
                        />
                    </div>
                    {errormsg && <div className="text-warning mb-3">{errormsg}</div>}
                    {successmsg && <div className="text-success mb-3">{successmsg}</div>}
                    <div className="mb-3">Time remaining: {Math.floor(timeLeft / 60)}:{timeLeft % 60 < 10 ? '0' : ''}{timeLeft % 60}</div>
                    <button type="submit" className="btn btn-primary w-100">Continue</button>
                    <div className="text-center mt-3">
                        <button type="button" onClick={handleBackToSignup} className="btn btn-link p-0">Back to Signup</button>
                    </div>
                </form>
                <div className="text-center mt-3">
                    <button
                        type="button"
                        onClick={handleResendCode}
                        className="btn btn-link p-0"
                        disabled={resendTimer > 0}
                    >
                        Resend Code {resendTimer > 0 && `(${resendTimer}s)`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Verification;
