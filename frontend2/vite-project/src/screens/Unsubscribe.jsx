import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import gifSad from '../assets/gifSad.gif';

const Unsubscribe = () => {
    const [message, setMessage] = useState('');
    const [showEmoji, setShowEmoji] = useState(false);
    const [userDoc, setUserDoc] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // State to track initial loading
    const location = useLocation();
    const navigate = useNavigate();
    const hasUnsubscribed = useRef(false); // Ref to track unsubscription

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const userId = query.get('user');

        if (userId && !hasUnsubscribed.current) { // Check if unsubscription has already been handled
            hasUnsubscribed.current = true; // Set it to true immediately to prevent further requests
            console.log('Fetching unsubscription for user:', userId);
            fetch(`http://localhost:3000/unsubscribe?user=${userId}`)
                .then(response => {
                    console.log('Unsubscribe response status:', response.status);
                    if (!response.ok) {
                        setShowEmoji(true);
                        throw new Error('Unsubscribe request failed');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Unsubscribe response data:', data); // Log the response data
                    setMessage(data.message);
                    setUserDoc(data.userDoc);
                    if (data.message.includes('error') || data.message.includes('Invalid') || data.message.includes('failed')) {
                        setShowEmoji(true);
                    }
                    setIsLoading(false); // Set loading to false after the fetch is done
                })
                .catch(error => {
                    console.error('Error during unsubscribe:', error); // Log errors
                    setMessage('An error occurred while trying to unsubscribe you.');
                    setShowEmoji(true);
                    setIsLoading(false); // Set loading to false even on error
                });
        } else if (!userId) {
            setMessage('Invalid unsubscription link.');
            setShowEmoji(true);
            setIsLoading(false); // Set loading to false for invalid link
        }
    }, [location.search]); // Add location.search to the dependency array

    const handleNavigate = () => {
        navigate('/');
    };

    const subscribeBack = () => {
        if (!userDoc) {
            setMessage('No user information available to subscribe back.');
            setShowEmoji(true);
            return;
        }

        fetch('http://localhost:3000/subscribe-back', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userDoc)
        })
            .then(response => {
                console.log('Subscribe back response status:', response.status);
                return response.text();
            })
            .then(data => {
                console.log('Subscribe back response data:', data); // Log the response data
                setMessage(data);
                if (data.includes('successfully')) {
                    setShowEmoji(false);
                } else {
                    setShowEmoji(true);
                }
            })
            .catch(error => {
                console.error('Error during subscribe back:', error); // Log errors
                setMessage('An error occurred while trying to subscribe you back.');
                setShowEmoji(true);
            });
    };

    // Render the component conditionally based on the loading state
    return (
        <div style={{ textAlign: 'center', color: 'white', paddingTop: 170 }}>
            <h1 style={{ fontSize: 120, color: 'white' }}>Place for unsubscribing</h1>
            {isLoading ? (
                <p style={{ fontSize: 30, paddingTop: 20, paddingBottom: 50, color: 'white' }}>Loading...</p>
            ) : (
                <>
                    <p style={{ fontSize: 30, paddingTop: 20, paddingBottom: 50, color: 'white' }}>{message}</p>
                    {showEmoji && (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: 20 }}>
                            <img src={gifSad} alt="Sad emoji" />
                        </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: 20 }}>
                        <button
                            onClick={handleNavigate}
                            style={{
                                backgroundColor: '#007BFF',
                                color: 'white',
                                border: 'none',
                                marginTop: '60px',
                                marginRight: '10px',
                                padding: '20px 35px',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontSize: '20px'
                            }}
                        >
                            Go to homepage
                        </button>
                        <button
                            onClick={subscribeBack}
                            style={{
                                backgroundColor: '#007BFF',
                                color: 'white',
                                border: 'none',
                                marginTop: '60px',
                                marginLeft: '10px',
                                padding: '20px 35px',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontSize: '20px'
                            }}
                        >
                            I want to subscribe back
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default Unsubscribe;
