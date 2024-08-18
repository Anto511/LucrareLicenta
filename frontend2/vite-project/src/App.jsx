import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Signup from './screens/Signup';
import './App.css';
import Login from './screens/Login';
import Verification from './screens/Verification';
import Homepage from './screens/Homepage';
import ForgotPassword from './screens/ForgotPassword';
import AboutUs from './details/AboutUs';
import ContactUs from './details/ContactUs';
import ResetPassword from './screens/ResetPassword';
import FilteringTool from './screens/FilteringTool';
import TermsOfService from './details/TermsOfService';
import PrivacyPolicy from './details/PrivacyPolicy';
import ShowResults from './screens/ShowResults';
import Unsubscribe from './screens/Unsubscribe';


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />}>
          <Route path="about-us" element={<AboutUs />} />
          <Route path="contact-us" element={<ContactUs />} />
        </Route>
        <Route path="/filter-tool" element={<FilteringTool />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verification" element={<Verification />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path='/show-results' element={<ShowResults />}></Route>
        <Route path="/unsubscribe" element={<Unsubscribe />} />
      </Routes>
    </Router>
  );
};

export default App;
