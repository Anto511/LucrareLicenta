import React, { useState, useEffect } from 'react';
import './Login.css';
import logo from '../assets/logo.png';

const Signup = ({ setShowVerification, setVerificationData, setShowLogin, initialData = {} }) => {
    const [data, setData] = useState({
        name: initialData.name || '',
        email: initialData.email || '',
        phoneNumber: initialData.phoneNumber || '',
        password: '',
        cpassword: '',
        dob: '',
        subscribe: false,
        termsAccepted: false,
    });

    const [errormsg, setErrormsg] = useState(null);

    useEffect(() => {
        if (initialData) {
            setData(prevData => ({
                ...prevData,
                name: initialData.name || '',
                email: initialData.email || '',
                phoneNumber: initialData.phoneNumber || '',
                password: '',
                cpassword: '',
                dob: ''
            }));
        }
    }, [initialData]);

    const Sendtobackend = (payload) => {
        fetch('http://localhost:3000/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
            .then(res => res.json())
            .then(response => {
                console.log(response);
                if (response.error) {
                    setErrormsg(response.error);
                } else if (response.message === "Verification Code Sent to your Email") {
                    setVerificationData({ data: response.userData, VerificationCode: response.VerificationCode });
                    setShowVerification();
                }
            }).catch((error) => {
                console.error('Network error:', error);
                setErrormsg('A network error occurred. Please try again later.');
            });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!data.name || !data.phoneNumber || !data.email || !data.password || !data.cpassword || !data.dob) {
            setErrormsg('All fields are required');
            return;
        } else if (data.password !== data.cpassword) {
            setErrormsg('Password and Confirm Password must be the same');
            return;
        } else if (!data.termsAccepted) {
            setErrormsg('You have to agree with our terms and conditions :(');
            return;
        }

        const payload = {
            ...data,
            dob: data.dob
        };

        Sendtobackend(payload);
    };

    return (
        <div className="loginPage">
            <div className="loginForm">
                <div className="text-center mb-4">
                    <img src={logo} alt="Logo" className="logo mb-3" />
                    <h2>Sign Up</h2>
                </div>
                <form onSubmit={handleSubmit} className="d-flex flex-column">
                    <div className="form-group mb-3">
                        <input
                            id="nameInput"
                            type="text"
                            className="form-control"
                            placeholder="Enter your name"
                            value={data.name}
                            onChange={(e) => setData({ ...data, name: e.target.value })}
                        />
                    </div>
                    <div className="form-group mb-3">
                        <input
                            id="emailInput"
                            type="email"
                            className="form-control"
                            placeholder="Enter your email"
                            value={data.email}
                            onChange={(e) => setData({ ...data, email: e.target.value })}
                        />
                    </div>
                    <div className="form-group mb-3">
                        <input
                            id="phoneInput"
                            type="tel"
                            className="form-control"
                            placeholder="123-456-7890"
                            value={data.phoneNumber}
                            onChange={(e) => setData({ ...data, phoneNumber: e.target.value })}
                        />
                    </div>
                    <div className="form-group mb-3">
                        <input
                            type="date"
                            id="dobInput"
                            className="form-control"
                            value={data.dob}
                            onChange={(e) => setData({ ...data, dob: e.target.value })}
                        />
                    </div>
                    <div className="form-group mb-3">
                        <input
                            id="passwordInput"
                            type="password"
                            className="form-control"
                            placeholder="Enter your password"
                            value={data.password}
                            onChange={(e) => setData({ ...data, password: e.target.value })}
                        />
                    </div>
                    <div className="form-group mb-3">
                        <input
                            id="passwordConfirmInput"
                            type="password"
                            className="form-control"
                            placeholder="Confirm your password"
                            value={data.cpassword}
                            onChange={(e) => setData({ ...data, cpassword: e.target.value })}
                        />
                    </div>
                    <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
                        <input
                            type="checkbox"
                            className="form-check-input"
                            id="subscribeCheck"
                            checked={data.subscribe}
                            onChange={(e) => setData({ ...data, subscribe: e.target.checked })}
                        />
                        <label htmlFor="subscribeCheck" style={{ marginLeft: '0.5rem' }}>Subscribe to occasional email recommendations</label>
                    </div>
                    <div className="form-group form-check mb-3">
                        <input
                            type="checkbox"
                            className="form-check-input"
                            id="termsCheck"
                            checked={data.termsAccepted}
                            onChange={(e) => setData({ ...data, termsAccepted: e.target.checked })}
                        />
                        <label className="form-check-label" htmlFor="termsCheck">
                            I agree to the terms and conditions
                        </label>
                    </div>
                    {errormsg && <div className="text-danger mb-3">{errormsg}</div>}
                    <div className="d-flex justify-content-center">
                        <button type="submit" className="btn btn-primary w-100">Sign Up</button>
                    </div>
                    <div className="text-center mt-3">
                        <button type="button" onClick={setShowLogin} className="btn btn-link p-0">Back to Login</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Signup;
