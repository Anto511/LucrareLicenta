import React from 'react';
import '../screens/Login.css';

const TermsOfService = () => {
    return (
        <div className="loginPage">
            <div className="loginForm">
                <div className="text-center mb-4">
                    <h2>Terms of Service</h2>
                </div>
                <div className="d-flex flex-column">
                    <div className="form-group mb-3">
                        <textarea
                            className="form-control"
                            rows="20"
                            value={`
Welcome to Find a Job. By accessing or using our application, you agree to comply with and be bound by the following terms and conditions.

Eligibility
You must be at least 16 years old to use our app. By using the app, you represent and warrant that you meet this age requirement.

User Account
To access certain features of the app, you may need to create an account. You agree to provide accurate, current, and complete information during the registration process.

Use of the App
You agree to use the app only for lawful purposes and in accordance with these Terms of Service. You agree not to:
- Use the app in any way that violates any applicable law or regulation.
- Upload or transmit any content that is unlawful, harmful, or otherwise objectionable.
- Interfere with or disrupt the app or servers.

Intellectual Property
All content, features, and functionality of the app, including but not limited to text, graphics, logos, and software, are the exclusive property of Find a Job or its licensors and are protected by intellectual property laws.

Disclaimers
The app is provided on an "as-is" and "as available" basis. We do not warrant that the app will be uninterrupted or error-free.

Limitation of Liability
In no event shall Find a Job, its directors, employees, or agents, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, or goodwill.

Governing Law
These Terms of Service are governed by and construed in accordance with the laws of the European Union.

Changes to Terms
We reserve the right to modify these Terms of Service at any time. We will notify you of any changes by posting the new Terms of Service on the app. Your continued use of the app after such modifications will constitute your acknowledgment and acceptance of the new terms.

Contact Us
If you have any questions about these Terms of Service, please contact us at nituantonia21@stud.ase.ro.`}
                            readOnly
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
