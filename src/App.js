import React from "react";
import "./css/App.css";
import { Routes, Route } from 'react-router-dom';

// Import your page components
import { SignupWizard } from './pages/SignUps/SignupWizard';
import SignupStart from './pages/SignUps/SignupStart';
import Gallery from './pages/Gallery/gallery';
import SubmissionForm from './pages/Submissions/submissionForm';
import Submissions from './pages/Submissions/submissions';
import AdminLogin from './pages/Admin/AdminLogin';
import AdminDashboard from './pages/Admin/AdminDashboard';

function App() {
	return (
		<div className="App">
			{/* <Navbar /> */}
			<Routes>
				<Route exact path="/" element={<SignupStart />} />
				<Route path="/signup/*" element={<SignupWizard />} />
				<Route path="/gallery" element={<Gallery />} />
				<Route path="/gallery/:eventId" element={<Gallery />} />
				<Route path="/submit" element={<SubmissionForm />} />
				<Route path="/submissions" element={<Submissions />} />
				<Route path="/admin" element={<AdminLogin />} />
				<Route path="/admin/dashboard" element={<AdminDashboard />} />
				{/* <Route path="/rules" element={<Rules />} /> */}
				{/* <Route path="/faq" element={<Faq />} /> */}
			</Routes>
		</div>
	);
}

export default App;