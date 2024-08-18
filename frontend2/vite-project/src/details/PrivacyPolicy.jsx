import React from 'react';
import '../screens/Login.css';

const PrivacyPolicy = () => {
    return (
        <div className="loginPage">
            <div className="loginForm">
                <div className="text-center mb-4">
                    <h2>Privacy Policy</h2>
                </div>
                <div className="d-flex flex-column">
                    <div className="form-group mb-3">
                        <textarea
                            className="form-control"
                            rows="20"
                            color='black'
                            value={`
Welcome to Find a Job. We are committed to protecting your privacy and ensuring that your personal data is handled in a safe and responsible manner. This Privacy Policy explains how we collect, use, and protect your personal information in compliance with the General Data Protection Regulation (GDPR).

Data Collection
We collect and process the following types of personal data:
- Personal Identification Information: Name, email address, phone number.
- Professional Information: CV/resume data, job descriptions, employment history, education, skills, and other relevant details.
- Usage Data: Information on how you interact with our app, including logs, device information, and IP addresses.

Data Use
Your data is used for the following purposes:
- Service Provision: To analyze and find similarities between your CV and job descriptions.
- Communication: To contact you with updates, notifications, and support.
- Improvement of Services: To enhance the app’s functionality and user experience.

Data Sharing
We do not share your personal data with third parties except in the following cases:
- With your consent.
- For legal requirements: If required by law or to protect our rights.
- Service Providers: With trusted partners who assist in operating our app and providing services.

Data Security
We implement appropriate technical and organizational measures to protect your data from unauthorized access, alteration, or destruction.

Your Rights
You have the following rights under the GDPR:
- Access: You can request access to your personal data.
- Correction: You can request correction of inaccurate data.
- Deletion: You can request deletion of your data.
- Restriction: You can request restriction of processing.
- Portability: You can request a copy of your data in a structured, commonly used format.
- Objection: You can object to the processing of your data.

Contact Us
If you have any questions or concerns about this Privacy Policy or your personal data, please contact us at nituantonia21@stud.ase.ro.`}
                            readOnly
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
