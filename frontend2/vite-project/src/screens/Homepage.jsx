import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, NavLink, Outlet } from 'react-router-dom';
import { useUser } from './UserContext';
import './Homepage.css';
import Login from './Login';
import Signup from './Signup';
import Verification from './Verification';
import ForgotPassword from './ForgotPassword';
import AboutUs from '../details/AboutUs';
import ContactUs from '../details/ContactUs';
import FilteringTool from './FilteringTool';
import PrivacyPolicy from '../details/PrivacyPolicy';
import TermsOfService from '../details/TermsOfService';


const Homepage = () => {
    const { user, loading, error, logout } = useUser();
    const [activeForm, setActiveForm] = useState(null);
    const [verificationData, setVerificationData] = useState(null);
    const [signupData, setSignupData] = useState({});

    useEffect(() => {
        console.log('User state:', user);
        if (error) {
            console.error('Error state:', error);
        }
        if (user) {
            setActiveForm(null);
        }
    }, [user, error]);

    useEffect(() => {
        if (activeForm && !user) {
            document.body.classList.add('overlay-active');
        } else {
            document.body.classList.remove('overlay-active');
        }
    }, [activeForm, user]);


    const handleAction = (type, data = {}) => {
        if (!user || ['privacy-policy', 'terms-of-service'].includes(type)) {
            setActiveForm(type);
            if (type === 'signup') {
                setSignupData(data);
            }
        }
    };

    const closeOverlay = () => {
        setActiveForm(null);
    };

    const handleVerificationSuccess = () => {
        setActiveForm(null);
    };

    const handleLogout = () => {
        logout();
    };

    return (
        <div className="homepage">
            <div className={`bg-image ${activeForm && !user ? 'blur' : ''}`}>
                <header className="header">
                    <div className="header-logo">Find a Job AI</div>
                    <nav className="header-nav">
                        <NavLink to="/" className="nav-link">Home</NavLink>
                        <a href="#about-us" className="nav-link">About Us</a>
                        <a href="#contact-us" className="nav-link">Contact Us</a>
                        {user ? (
                            <button className="nav-link" onClick={handleLogout}>Logout</button>
                        ) : (
                            <>
                                <button className="nav-link" onClick={() => handleAction('login')}>Login</button>
                                <button className="nav-link" onClick={() => handleAction('signup')}>Sign Up</button>
                            </>
                        )}
                    </nav>
                </header>
                <div className="content">
                    <div className="text-center mb-5">
                        <h1 className="display-5 fw-bold text-white">Find some job suggestions easily</h1>
                        <p className="lead">Convert your PDF format CV and let's find out what job suits you the best for free!</p>
                    </div>
                    <div>
                        <FilteringTool />
                    </div>

                    <Outlet />
                    {loading ? (
                        <div className="p-4 d-flex justify-content-center">
                            Loading...
                        </div>
                    ) : user ? (
                        <div className="p-4 d-flex justify-content-center">
                            <h2>Hi {user.name}!</h2>
                        </div>
                    ) : (
                        <div></div>
                    )}
                </div>
                <div id="about-us">
                    <AboutUs />
                </div>
                <div id="contact-us">
                    <ContactUs />
                </div>
            </div>
            {activeForm && (
                <div className="overlay" onClick={closeOverlay}>
                    <div className="overlay-content" onClick={(e) => e.stopPropagation()}>
                        {activeForm === 'login' && <Login setShowSignup={() => handleAction('signup')} setShowForgotPassword={() => handleAction('forgot-password')} />}
                        {activeForm === 'signup' && (
                            <Signup
                                setShowVerification={() => handleAction('verification')}
                                setVerificationData={setVerificationData}
                                setShowLogin={() => handleAction('login')}
                                initialData={signupData}
                            />
                        )}
                        {activeForm === 'verification' && (
                            <Verification
                                verificationData={verificationData}
                                onVerificationSuccess={handleVerificationSuccess}
                                setShowSignup={(data) => handleAction('signup', data)}
                            />
                        )}
                        {activeForm === 'forgot-password' && (
                            <ForgotPassword setShowLogin={() => handleAction('login')} />
                        )}
                        {activeForm === 'privacy-policy' && (
                            <PrivacyPolicy />
                        )}
                        {activeForm === 'terms-of-service' && (
                            <TermsOfService />
                        )}
                    </div>
                </div>
            )}
            <footer className="footer">
                <div className="footer-content">
                    <div className="footer-links">
                        <a className="footer-link" onClick={() => handleAction('privacy-policy')}>Privacy Policy</a>
                        <a className="footer-link" onClick={() => handleAction('terms-of-service')}>  Terms of Service</a>
                    </div>
                    <div className="contact-info">
                        <p>Contact us: <a href="mailto:nituantonia21@stud.ase.ro">nituantonia21@stud.ase.ro</a></p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Homepage;
