import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Button from '@mui/material/Button';
import { useActiveEventContext } from "../../context/EventContext";

export default function Home() {
	const navigate = useNavigate();
	const { activeEvent } = useActiveEventContext();
	const [existingForm, setExistingForm] = useState(false);

	useEffect(() => {
		let prefState = JSON.parse(localStorage.getItem("prefState"));

		setExistingForm(prefState !== null);
	}, []);

	const handleClick = () => {
		navigate("/signup/preferences");
	}

	const handleReset = () => {
		localStorage.clear();
		setExistingForm(false);
	}

	if (!activeEvent) return null;

	return (
		<div className="homePage">
			<div className="container">
				<div className="row justify-content-center">
					<h2 style={{ maxWidth: '970px', marginTop: '5%' }}>
						WELCOME TO THE SIGN-UP SITE FOR
					</h2>
				</div>
				<div className="row justify-content-center" style={{ padding: 0 }}>
					<h1 style={{ margin: 0 }}>
						<strong>{`${activeEvent.title.toUpperCase()}!`}</strong>
					</h1>
				</div>
			</div>
			<div className="container-fluid" style={{ paddingTop: '2%' }}>
				{activeEvent.status === 'signups_closed' && (
					<div className="alert alert-warning container" style={{ maxWidth: '750px' }}>
						<strong>Signups are currently closed!</strong><br />
						You may still use this form to generate your signup code for your own records, but you will not be able to submit or verify it.
					</div>
				)}
				<p style={{ maxWidth: '750px' }}>
					This site is designed to guide you through the sign up process before
					providing you with the post to copy paste onto the FR forums! Progress is saved between pages on button
					press.
					<br /><br />
					Don't know what that is? Find out in our&nbsp;
					<a href={activeEvent.mainThreadUrl}>
						official forum thread
					</a>.
					<br /> For more details on sign-up, refer to the&nbsp;
					<a href={activeEvent.signupThreadUrl}>sign-up thread</a>.
					<br />{" "}
					<strong>SIGN-UPS
						CLOSE {new Date(activeEvent.signUpDeadLine).toLocaleString('en-US', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone })}</strong>
					<br /><br />
					No personal data is collected or stored (local storage is used to retain form data). We are neither
					affiliated with nor endorsed by
					Stormlight Workshop LLC.
					<br />
					<br />
				</p>
				<p style={{ color: "#d32f2f", maxWidth: '970px' }}>
					<strong>* By signing up, you are agreeing and committing
						to producing a
						drawing by the deadline to the best of your ability
						for the given tier, and understand failing to do so may bar you from participating in future
						events.</strong>
				</p>
			</div>
			<br />
			<div className="container">
				<button
					type="button"
					className="btn btn-primary rounded"
					onClick={handleClick}
					style={{ marginBottom: '5%' }}
				>
					{existingForm ? "Edit Form" : "Let's Get Started!"}
				</button>
			</div>
			{existingForm ?
				<div>
					<div className="container-fluid" style={{ paddingBottom: '1%' }}>
						<p style={{ maxWidth: '750px' }}>
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
