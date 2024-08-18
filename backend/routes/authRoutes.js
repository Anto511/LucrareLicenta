const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model("User");
const Message = mongoose.model('Message');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer");
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const { MongoClient, ObjectId } = require('mongodb');


const BCRYPT_ROUNDS = 12;
const MAX_FAILED_ATTEMPTS = 7;

async function mailer(receiverEmail, subject, text, html) {
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    try {
        let info = await transporter.sendMail({
            from: process.env.EMAIL,
            to: receiverEmail,
            subject: subject,
            text: text,
            html: html,
        });

        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Failed to send verification email.");
    }
}


const validateSignupData = (data) => {
    const { name, email, password, dob, phoneNumber } = data;

    if (!name || !email || !password || !dob || !phoneNumber) {
        return "Please add all the fields";
    }

    if (typeof name !== 'string' || name.trim().length === 0) {
        return "Invalid name";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return "Invalid email address";
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$.!%*?&]{6,}$/;
    if (!passwordRegex.test(password)) {
        return "Password must be at least 6 characters long and include uppercase letters, lowercase letters, numbers and special characters";
    }

    const dobDate = new Date(dob);
    const today = new Date();
    if (isNaN(dobDate)) {
        return "Invalid date of birth";
    }
    const age = today.getFullYear() - dobDate.getFullYear();
    const monthDifference = today.getMonth() - dobDate.getMonth();
    const dayDifference = today.getDate() - dobDate.getDate();
    if (age < 16 || (age === 16 && (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)))) {
        return "You must be at least 16 years old";
    }

    const phoneRegex = /^[0-9]{4}-[0-9]{3}-[0-9]{3}$/;
    if (!phoneRegex.test(phoneNumber)) {
        return "Invalid phone number format. Use 0123-456-789";
    }

    return null;
};
router.post('/signup', async (req, res) => {
    const validationError = validateSignupData(req.body);

    if (validationError) {
        return res.status(422).json({ error: validationError });
    }

    const { name, email, password, dob, phoneNumber, subscribe } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(422).json({ error: "User already exists with this email" });
        }

        const VerificationCode = Math.floor(100000 + Math.random() * 900000);

        try {
            await mailer(
                email,
                "Signup Verification",
                `Your Verification Code is ${VerificationCode}`,
                `<b>Your Verification Code is ${VerificationCode}</b>`
            );
        } catch (emailError) {
            console.error('Email sending error:', emailError);
            return res.status(500).json({ error: "Failed to send verification email. Please check your email address and try again." });
        }

        res.json({
            message: "Verification Code Sent to your Email",
            VerificationCode,
            userData: { name, email, password, dob, phoneNumber, subscribe }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create user" });
    }
});

router.post('/verify', async (req, res) => {
    const { name, email, password, dob, phoneNumber, code, subscribe } = req.body;
    if (!name || !email || !password || !dob || !phoneNumber || !code) {
        return res.status(422).json({ error: "Please add all the fields" });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(422).json({ error: "User already exists with this email" });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({ name, email, password: hashedPassword, dob, phoneNumber, subscribe });
        await user.save();
        const token = jwt.sign({ _id: user._id, name: user.name, email: user.email }, process.env.JWT_SECRET);
        res.json({ message: "User Registered Successfully", token, user: { name: user.name, email: user.email, subscribe: user.subscribe } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});


router.post('/resend-code', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    try {
        const user = await User.findOne({ email });
        if (user) {
            return res.status(404).json({ error: "User already exists!" });
        }

        await mailer(
            email,
            "Signup Verification",
            `Your New Verification Code is ${verificationCode}`,
            `<b>Your New Verification Code is ${verificationCode}</b>`
        );

        res.json({ VerificationCode: verificationCode });
    } catch (error) {
        console.error('Error during resend verification code:', error);
        res.status(500).json({ error: "Failed to resend verification code. Please try again." });
    }
});

router.post('/signin', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(422).json({ error: "Please add email or password" });
    }

    try {
        const savedUser = await User.findOne({ email });
        if (!savedUser) {
            return res.status(422).json({ error: "User with this email does not exist" });
        }

        if (savedUser.isLocked) {
            return res.status(423).json({ error: "Account is locked due to too many failed login attempts" });
        }

        const isMatch = await bcrypt.compare(password, savedUser.password);

        if (isMatch) {
            savedUser.failedLoginAttempts = 0;
            await savedUser.save();
            const token = jwt.sign({ _id: savedUser._id, name: savedUser.name, email: savedUser.email }, process.env.JWT_SECRET);
            res.json({ token, user: { name: savedUser.name, email: savedUser.email, subscribe: savedUser.subscribe } });
        } else {
            savedUser.failedLoginAttempts += 1;
            if (savedUser.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
                savedUser.isLocked = true;
                await savedUser.save();
                return res.status(423).json({ error: "Account is locked due to too many failed login attempts" });
            } else {
                await savedUser.save();
                return res.status(422).json({ error: "Invalid password" });
            }
        }
    } catch (err) {
        console.error('Error during signin:', err);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(422).json({ error: "Please provide your email" });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(422).json({ error: "User with this email does not exist" });
        }

        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        user.resetToken = token;
        user.resetTokenExpiry = Date.now() + 3600000;
        await user.save();

        const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;
        await mailer(email, "Password Reset", `Please use the following link to reset your password: ${resetLink}`, `<b>Please use the following link to reset your password:</b><br><a href="${resetLink}">${resetLink}</a>`);
        res.json({ message: "Password reset link sent to your email" });
    } catch (err) {
        console.error('Error during forgot password:', err);
        res.status(500).json({ error: "Internal server error" });
    }
});


router.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
        return res.status(422).json({ error: "Please provide all fields" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ _id: decoded._id, resetToken: token, resetTokenExpiry: { $gt: Date.now() } });
        if (!user) {
            return res.status(422).json({ error: "Invalid token or user does not exist" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetToken = null;
        user.resetTokenExpiry = null;
        await user.save();
        res.json({ message: "Password reset successfully" });
    } catch (err) {
        console.error('Error during reset password:', err);
        res.status(500).json({ error: "Internal server error" });
    }
});


const generateEmailContent = (results, userId) => {
    let content = '<h1>Hi, here are your weekly job recommendations:</h1>';
    content += '<ul>';
    results.forEach(result => {
        content += `
            <li>
                <h2>${result.title}</h2>
                <p><strong>Company:</strong> ${result.company}</p>
                <p><strong>Location:</strong> ${result.location}</p>
                <p><a href="${result.url}">View Job Posting</a></p>
            </li>
        `;
    });
    content += '</ul>';
    content += `<p>If you wish to unsubscribe from these emails, please <a href="http://localhost:5173/unsubscribe?user=${userId}">click here</a>.</p>`;
    return content;
};

router.post('/send-email', (req, res) => {
    const { email, _id, results } = req.body;
    const emailContent = generateEmailContent(results, _id);
    mailer(email, "Your weekly recommandations", '', emailContent)
    console.log("email sent")
});

const url = process.env.mongo_URL;
const dbName = 'test';


router.get('/unsubscribe', async (req, res) => {
    const pdfCollectionId = req.query.user;
    console.log(`Received unsubscribe request for user: ${pdfCollectionId}`);

    if (!ObjectId.isValid(pdfCollectionId)) {
        return res.status(400).json({ message: 'Invalid user ID', userDoc: null });
    }

    const objectId = new ObjectId(pdfCollectionId);

    const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        await client.connect();
        const db = client.db(dbName);
        const pdfCollection = db.collection('pdf_collection');
        const usersCollection = db.collection('users');

        const pdfDoc = await pdfCollection.findOne({ _id: objectId });
        if (!pdfDoc) {
            return res.status(404).json({ message: 'User not found. :(', userDoc: null });
        }

        const userToken = pdfDoc.user_token;
        const userDoc = await usersCollection.findOne({ email: userToken });
        if (!userDoc) {
            return res.status(404).json({ message: 'User not found. :(', userDoc: null });
        }

        const updateResult = await usersCollection.updateOne({ _id: userDoc._id }, { $set: { subscribe: false } });
        if (updateResult.modifiedCount === 1) {

            const deleteResult = await pdfCollection.deleteOne({ _id: objectId });
            if (deleteResult.deletedCount === 1) {
                res.json({ message: 'You have been unsubscribed successfully.', userDoc });
            } else {
                console.error(`Failed to delete document from pdf_collection with _id: ${objectId}`);
                res.status(500).json({ message: 'Failed to delete document from pdf_collection.', userDoc: null });
            }
        } else {
            console.error(`Failed to update user subscribe field for user: ${userDoc._id}`);
            res.status(500).json({ message: 'Failed to unsubscribe.', userDoc: null });
        }
    } catch (error) {
        console.error('Error during database operations:', error);
        res.status(500).json({ message: 'Internal server error.', userDoc: null });
    } finally {
        await client.close();
    }
});

router.post('/subscribe-back', async (req, res) => {
    const user = req.body;
    const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();
        const db = client.db(dbName);
        const usersCollection = db.collection('users');

        const result = await usersCollection.updateOne({ _id: new ObjectId(user._id) }, { $set: { subscribe: true } });
        if (result.modifiedCount === 1) {
            res.send('You have been subscribed back successfully.');
        } else {
            res.status(500).send('Failed to subscribe back.');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error.');
    } finally {
        await client.close();
    }
});

module.exports = router;


const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];

    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }
            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

router.post('/messages', authenticateJWT, async (req, res) => {
    const { name, email, message } = req.body

    if (!name || !email || !message) {
        return res.status(400).send({ message: 'All fields are required' });
    }

    try {
        const newMessage = new Message({ name, email, message, userId: req.user.id });
        await newMessage.save();
        res.status(200).send({ message: 'Message sent successfully' });
    } catch (error) {
        res.status(500).send({ message: 'Failed to send message', error });
    }
});

const filters = {
    countries: [
        'Argentina', 'Australia', 'Austria', 'Bahrain', 'Belgium', 'Brazil', 'Canada', 'Chile', 'China', 'Colombia', 'Costa Rica',
        'Czech Republic', 'Denmark', 'Ecuador', 'Egypt', 'Finland', 'France', 'Germany', 'Greece', 'Hong Kong', 'Hungary',
        'India', 'Indonesia', 'Ireland', 'Israel', 'Italy', 'Japan', 'Kuwait', 'Luxembourg', 'Malaysia', 'Mexico', 'Morocco',
        'Netherlands', 'New Zealand', 'Nigeria', 'Norway', 'Oman', 'Pakistan', 'Panama', 'Peru', 'Philippines', 'Poland',
        'Portugal', 'Qatar', 'Romania', 'Saudi Arabia', 'Singapore', 'South Africa', 'South Korea', 'Spain', 'Sweden',
        'Switzerland', 'Taiwan', 'Thailand', 'Turkey', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States',
        'Uruguay', 'Venezuela', 'Vietnam'
    ]
};

router.get('/filters', (req, res) => {
    res.json(filters);
})



const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath);
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

router.post('/upload-pdf', upload.single('file'), async (req, res) => {
    const modelStatusResponse = await axios.get('http://localhost:3000/model-status');
    if (modelStatusResponse.data.message !== 'Model is loaded') {
        const errorMessage = 'Model is not loaded yet, please try again later';
        return res.status(503).json({ message: errorMessage, error: errorMessage, script_outputs: [errorMessage] });
    }
    else {
        const { user_email, wants_to_be_in_db } = req.body;

        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }

        const formData = new FormData();
        formData.append('file', fs.createReadStream(req.file.path));
        formData.append('user_email', user_email);
        formData.append('db_name', 'test');
        formData.append('collection_name', 'pdf_collection');
        formData.append('mongo_uri', process.env.mongo_URL);
        formData.append('wants_to_be_in_db', wants_to_be_in_db)

        try {
            const response = await axios.post('http://0.0.0.0:5000/process-pdf', formData, {
                headers: formData.getHeaders()
            });
            res.status(200).json({ message: 'File uploaded and processed successfully', data: response.data });
        } catch (error) {
            console.error('Error processing file:', error.response ? error.response.data.error : error.message);
            res.status(500).json({ message: 'Error processing file', error: error.response ? error.response.data.error : error.message });
        }
    }
});

router.post('/delete-pdf', async (req, res) => {
    const { user_email } = req.body;

    if (!user_email) {
        return res.status(400).send('User email is required.');
    }

    try {
        const uploadPath = path.join(__dirname, 'uploads');
        const files = fs.readdirSync(uploadPath);

        const userFiles = files.filter(file => file.includes(user_email));

        userFiles.forEach(file => {
            fs.unlinkSync(path.join(uploadPath, file));
        });

        res.status(200).json({ message: 'User files deleted successfully' });
    } catch (error) {
        console.error('Error deleting files:', error.message);
        res.status(500).json({ message: 'Error deleting files', error: error.message });
    }
});

router.get('/model-status', async (req, res) => {
    try {
        const response = await axios.get('http://0.0.0.0:5000/model-status');
        res.json(response.data);
    } catch (error) {
        console.error('Error communicating with Python service:', error);
        res.status(500).json({ message: 'Error communicating with Python service', error: error.message });
    }
});


router.post('/process-filters', async (req, res) => {
    const { selectedFilters, user_email, wants_to_be_in_db } = req.body;
    if (!selectedFilters.keywords || !selectedFilters.country || !user_email) {
        return res.status(400).json({ message: 'Invalid request payload' });
    }

    try {
        const modelStatusResponse = await axios.get('http://localhost:3000/model-status');
        if (modelStatusResponse.data.message !== 'Model is loaded') {
            const errorMessage = 'Model is not loaded yet, please try again later';
            return res.status(503).json({ message: errorMessage, error: errorMessage, script_outputs: [errorMessage] });
        }
        const response = await axios.post('http://0.0.0.0:5000/process-filters', { filters: selectedFilters, email: user_email, wants_to_be_in_db: wants_to_be_in_db });
        res.status(200).json({ message: 'Filters processed successfully', data: response.data.results });
    } catch (error) {
        console.error('Error processing filters:', error);
        const errorMessage = error.response && error.response.data ? error.response.data.message : error.message;
        const scriptOutputs = error.response && error.response.data ? error.response.data.script_outputs : [];
        res.status(500).json({ message: 'Error processing filters', error: errorMessage, script_outputs: scriptOutputs });
    }
});


module.exports = router;
