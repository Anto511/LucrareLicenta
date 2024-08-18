import React, { useState } from 'react';
import './ContactUs.css';
import animationImage from '../assets/contactusphoto.jpg';
import { useUser } from '../screens/UserContext';

const ContactUs = () => {
    const { user } = useUser();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.message) {
            alert('All fields are required');
            return;
        }

        if (!user) {
            alert('You need to be logged in to send a message');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify(formData)
            });
            const text = await response.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (jsonError) {
                console.error('JSON parsing error:', jsonError)
                throw new Error('Invalid JSON response');
            }

            if (response.ok) {
                alert('Message sent successfully');
                setFormData({
                    name: '',
                    email: '',
                    message: ''
                });
            } else {
                alert('Failed to send message: ' + (data.message || 'Unknown error'));
            }
        } catch (error) {
            alert('Failed to send message');
        }
    };

    return (
        <div className="contact-and-testimonials">
            <div className="contact-us-container">
                <div className="contact-form">
                    <h2>Contact Us</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <span className="icon"><i className="fas fa-user"></i></span>
                            <input
                                type="text"
                                name="name"
                                placeholder="Name"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="input-group">
                            <span className="icon"><i className="fas fa-envelope"></i></span>
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="input-group">
                            <span className="icon"><i className="fas fa-comment"></i></span>
                            <textarea
                                name="message"
                                placeholder="Message"
                                value={formData.message}
                                onChange={handleChange}
                            ></textarea>
                        </div>
                        <button type="submit" className="btn-primary">Send Message</button>
                    </form>
                </div>
                <div className="animation-container">
                    <img src={animationImage} alt="Animation" className="animation-image" />
                </div>
            </div>

            <div className="testimonials">
                <h2>Testimonials</h2>
                <div className="testimonial">
                    <p>"This service is fantastic! It not only helped me find the job of my dreams but also provided exceptional support throughout the entire process."</p>
                    <p>- Jane Doe</p>
                </div>
                <div className="testimonial">
                    <p>"A wonderful experience from start to finish. Highly recommend their professional and dedicated approach to job placement!"</p>
                    <p>- John Smith</p>
                </div>
                <div className="testimonial">
                    <p>"Excellent customer service and great results. The team was supportive and responsive, ensuring I landed a role that perfectly fits my skills and aspirations."</p>
                    <p>- Mary Johnson</p>
                </div>
            </div>
        </div>
    );
};

export default ContactUs;
