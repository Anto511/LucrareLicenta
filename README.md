# Job Finder AI - README

## Project Description

**Job Finder AI** is a web application designed to help users find suitable job opportunities based on their resumes and specified preferences. The application integrates an Artificial Intelligence (AI) algorithm that scans multiple job portals and recommends relevant job opportunities. Users can search for jobs by entering the desired job title and location.

## The Main Features

1. **Personalized Job Recommendations**: The integrated AI analyzes the user's resume and provides links to suitable job postings from various job portals.

2. **Job Search**: Users can input the desired job title and location to receive specific recommendations.

3. **Authentication and Registration**:
   - **Sign Up**: Users can register by filling out a form with their personal details. After registration, a verification code is sent via email for validation.
   - **Login**: The standard authentication process where users can log in using their email and password.
   - **Password Recovery**: If a user forgets their password, they can request a reset via email.

4. **Company Webpage Simulation**: The application offers an experience similar to a company webpage, focused on helping users find their ideal job.

## Technologies Used

### Frontend
- **React.js**: The frontend application is built using React.js, providing a modern user interface.

### Backend
- **Node.js**: The main server handling business logic and communication between the frontend and backend.
- **Flask**: Used for managing APIs and implementing AI algorithms.
- **Python**: The programming language used for developing the Artificial Intelligence algorithms that analyze resumes and recommend jobs.

### Prerequisites
- Node.js
- Python 3.9
- Flask

### Installation Steps

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Anto511/LucrareLicenta.git
   cd LucrareLicenta
   
2. **Install Frontend Dependencies**:
   ```bash
   cd frontend2
   npm create vite@latest .
   npm install
   npm run dev

4. **Install Backend Dependencies**:
   ```bash
   cd backend
   npm init
   npm i <the_used_packages>
   npm start

6. **Install Python Dependencies**
   ```bash
   cd LICENTACV - PROIECT
   pip install <the_used_packages>

8. Access the Application:
   Open your browser and go to http://localhost:5173(or your desired port) to interact with the application.

