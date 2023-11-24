import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import CONFIG from "../../config/CONFIG.json";
import Button from '@mui/material/Button';

export default function Home() {
	const navigate = useNavigate();

	const [existingForm, setExistingForm] = useState(false);

	useEffect(() => {
		let prefState = JSON.parse(localStorage.getItem("prefState"));

		console.log(prefState !== null)

		setExistingForm(prefState !== null);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	function handleClick() {
		navigate("/preferences");
	}

	function handleReset() {
		localStorage.clear();
		setExistingForm(false);
	}

	return (
			<div className="homePage">
				<div className="container">
					<div className="row justify-content-center">
						<h2 style={{maxWidth: 970 + "px", marginTop: 5 + "%"}}>
							WELCOME TO THE SIGN-UP SITE FOR
						</h2>
					</div>
					<div className="row justify-content-center" style={{padding: 0}}>
						<h1 style={{margin: 0}}>
							<strong>FLIGHT RISING SECRET SANTA ART TRADE 2023!</strong>
						</h1>
					</div>
				</div>
				<div className="container-fluid" style={{paddingTop: 2 + "%"}}>
					<p style={{maxWidth: 750 + "px"}}>
						This site is designed to guide you through the sign up process before
						providing you with the post to copy paste onto the FR forums! Progress is saved between pages on button
						press.
						<br/><br/>
						Don't know what that is? Find out in our&nbsp;
						<a href={CONFIG.mainThreadUrl}>
							official forum thread
						</a>.
						<br/> For more details on sign-up, refer to the&nbsp;
						<a href={CONFIG.signupThreadUrl}>sign-up thread</a>.
						<br/>{" "}
						<strong>SIGN-UPS
							CLOSE {new Date(CONFIG.signUpDeadLine).toLocaleString('en-US', {timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone})}</strong>
						<br/><br/>
						No personal data is collected or stored (local storage is used to retain form data). We are neither
						affiliated with nor endorsed by
						Stormlight Workshop LLC.
						<br/>
						<br/>
						{/*TODO MAKE THIS A MODAL POPUP RIGHT BEFORE THE END! */}
					</p>
					<p style={{color: "#d32f2f", maxWidth: 970 + "px"}}>
						<strong>* By signing up, you are agreeing and committing
							to producing a
							drawing by the deadline to the best of your ability
							for the given tier, and understand failing to do so may bar you from participating in future
							events.</strong>
					</p>
				</div>
				<br/>
				<div className="container">
					<button
							type="button"
							className="btn btn-primary rounded" // Added the "rounded" class for rounded corners
							onClick={handleClick}
							style={{marginBottom: 5 + "%"}}
					>
						{existingForm ? "Edit Form" : "Let's Get Started!"}
					</button>
				</div>
				{existingForm ?
						<div>
							<div className="container-fluid" style={{paddingBottom: 1 + "%"}}>
								<p style={{maxWidth: 750 + "px"}}>
									You have an existing form, possibly from last year! Click here to reset it.
								</p>
							</div>
							<div className="container">
								<Button
										onClick={handleReset}
										variant={"outlined"}
										color={"error"}>RESET FORM
								</Button>
							</div>
						</div> : undefined}
			</div>
	);
}
