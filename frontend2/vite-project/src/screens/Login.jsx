import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import './Login.css';
import logo from '../assets/logo.png';


const Login = ({ setShowSignup, setShowForgotPassword }) => {
    const [data, setData] = useState({
        email: '',
        password: '',
    });

    const [errormsg, setErrormsg] = useState(null);
    const { login } = useUser();
    const navigate = useNavigate();

    const Sendtobackend = async (e) => {
        e.preventDefault();
        if (!data.email || !data.password) {
            setErrormsg('All fields are required');
            return;
        }
        try {
            await login(data.email, data.password);
            navigate('/');
        } catch (err) {
            if (err.message === "Account is locked due to too many failed login attempts") {
                setErrormsg("Your account has been locked due to too many failed login attempts. Please contact support.");
            } else {
                setErrormsg(err.message);
            }
        }
    };

    return (
        <div className="loginPage">
            <div className="loginForm">
                <div className="text-center mb-4">
                    <img src={logo} alt="Logo" className="logo mb-3" />
                    <h2>Welcome Back!</h2>
                </div>
                <form onSubmit={Sendtobackend} className="d-flex flex-column">

                    <div className="form-group mb-3 mt-5">
                        <input
                            id="emailInput"
                            type="email"
                            className="form-control"
                            placeholder="Enter email address"
                            value={data.email}
                            onChange={(e) => setData({ ...data, email: e.target.value })}
                        />
                    </div>
                    <div className="form-group mb-3">
                        <input
                            id="passwordInput"
                            type="password"
                            className="form-control"
                            placeholder="Password"
                            value={data.password}
                            onChange={(e) => setData({ ...data, password: e.target.value })}
                        />
                    </div>
                    {errormsg && <div className="text-danger mb-3">{errormsg}</div>}
                    <div className="d-flex justify-content-between mb-3">
                        <button type="submit" className="btn btn-primary w-100">Sign in</button>
                    </div>
                    <div className="d-flex justify-content-between mb-3">
                        <button type="button" onClick={setShowForgotPassword} className="btn btn-link p-0">Forgot password?</button>
                    </div>
                    <div className="text-center">
                        <span>Don't have an account? </span>
                        <button type="button" onClick={setShowSignup} className="btn btn-link p-0">Sign Up</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
