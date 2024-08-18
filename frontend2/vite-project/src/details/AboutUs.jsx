import React from 'react';
import './AboutUs.css';
import image1 from '../assets/image1AboutUs.jpg';
import image3 from '../assets/image3AboutUs.jpg';
import image2 from '../assets/image2AboutUs.jpg';


const AboutUs = () => {
    return (
        <div className="about-us">
            <h1 className='bigTitle'>About Us</h1>
            <div className="section">
                <div className="text">
                    <h3 className='titles'>Our Story</h3>
                    <p>Welcome to Find a Job, where your career aspirations meet our cutting-edge technology. We are dedicated to revolutionizing the job search experience, making it smarter, faster, and more personalized than ever before.</p>
                    <p>At Find a Job, we understand that finding the perfect job can be a challenging and time-consuming process. That’s why we’ve created a unique service designed to take the stress out of your job search. Our innovative AI technology analyzes your CV and matches your skills, experience, and career goals with the best job opportunities available.</p>
                    <h3 className='titles'>Our Mission</h3>
                    <p>To empower job seekers by providing them with personalized, efficient, and effective job search solutions that align with their professional goals and aspirations.</p>
                </div>
                <div className="image">
                    <img src={image1} alt="Our Story" />
                </div>
            </div>
            <div className="section">
                <div className="image">
                    <img src={image3} alt="How It Works" />
                </div>
                <div className="text">
                    <h3 className='titles'>How It Works</h3>
                    <ol>
                        <li><strong>Submit Your CV:</strong> Simply upload your CV to our platform. Our system is designed to accept various formats, ensuring a seamless process.</li>
                        <li><strong>AI-Powered Analysis:</strong> Our advanced AI technology carefully analyzes your CV, identifying key skills, experiences, and preferences to understand your unique profile.</li>
                        <li><strong>Personalized Job Matches:</strong> Based on the analysis, our AI searches thousands of job listings to find the best matches for you.</li>
                        <li><strong>Real-Time Updates:</strong> Stay ahead of the curve with real-time updates on new job opportunities. Our platform continuously scans for new listings, ensuring you never miss an opportunity.</li>
                        <li><strong>Expert Guidance:</strong> Alongside our AI-driven matches, our team of career experts is available to provide personalized advice and support, helping you navigate the job market with confidence.</li>
                    </ol>
                </div>
            </div>
            <div className="section reverse">
                <div className="image">
                    <img src={image2} alt="Why Choose Us?" />
                </div>
                <div className="text">
                    <h3 className='titles'>Why Choose Us?</h3>
                    <ul>
                        <li><strong>Precision Matching:</strong> Our AI technology ensures that you are matched with jobs that truly fit your profile, increasing your chances of success.</li>
                        <li><strong>Time-Saving:</strong> By automating the job search process, we save you valuable time, allowing you to focus on preparing for interviews and advancing your career.</li>
                        <li><strong>Expert Support:</strong> Our dedicated team is here to support you every step of the way, offering insights and advice tailored to your individual needs.</li>
                        <li><strong>Confidential and Secure:</strong> Your privacy is our priority. We ensure that your personal information is handled with the utmost care and security.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AboutUs;
