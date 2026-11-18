import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';

import { useActiveEventContext } from "../../context/EventContext";
import { useSignupContext } from "../../context/SignupContext";

export default function Finish() {
	const [isDirty, setIsDirty] = useState(true);
	const [isVerified, setIsVerified] = useState(false);
	const [saveStatus, setSaveStatus] = useState("idle"); // idle, saving, saved, error
	const [saveMessage, setSaveMessage] = useState("");

	const { state, dispatch, generateFinalText } = useSignupContext();
	const { activeEvent } = useActiveEventContext();
	const navigate = useNavigate();

	const textAreaRef = useRef(null);
	const autoSaveStartedRef = useRef(false);
	const finalText = generateFinalText();
	const signupsClosed = ['signups_closed', 'concluded'].includes(activeEvent.status);

	// Check status on mount so returning verified users see the correct state.
	useEffect(() => {
		if (!state.signupUuid) return;

		axios.get(`/api/checkSignupStatus?uuid=${state.signupUuid}`)
			.then(response => {
				if (response.data.verified) {
					setIsVerified(true);
				}
			})
			.catch(error => {
				console.error("Error checking signup status:", error);
			});
	}, [state.signupUuid]);

	// Warn before leaving only while the current form has not been saved.
	useEffect(() => {
		const handleBeforeUnload = (event) => {
			if (isDirty) {
				event.preventDefault();
				event.returnValue = "Are you sure? You have not finished your form yet and leaving will lose your progress.";
				return event.returnValue;
			}
		};

		window.addEventListener('beforeunload', handleBeforeUnload);

		return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
		};
	}, [isDirty]);

	const selectTextArea = useCallback(() => {
		if (textAreaRef.current) {
			textAreaRef.current.select();
			textAreaRef.current.setSelectionRange(0, 99999);
		}
	}, []);

	const saveSignup = useCallback(async () => {
		if (signupsClosed || !state.isInitialized || !state.signupUuid) {
			return false;
		}

		setSaveStatus("saving");
		setSaveMessage("Saving your form...");

		// Sanitize state before sending
		const { isInitialized, ...signupData } = state;

		try {
			const response = await axios.post('/api/saveSignup', {
				...signupData,
				eventId: activeEvent._id
			});

			setSaveStatus("saved");
			setIsVerified(!!response.data.verified);
			setSaveMessage(
				response.data.verified
					? "Your signup is saved and verified."
					: "Your form is saved. Post the code on the signup thread; an admin will verify it."
			);
			setIsDirty(false);
			return true;
		} catch (error) {
			console.error("Error saving signup:", error);
			setSaveStatus("error");

			// Surface actionable server validation errors, but keep unexpected
			// failures friendly (and don't leak internal details).
			const serverError = error.response?.status < 500 ? error.response?.data?.error : null;
			setSaveMessage(
				serverError ||
				"We couldn't save your form right now. Your code below is still valid — copy and post it, and we'll try saving again when you click the button."
			);
			return false;
		}
	}, [state, activeEvent._id, signupsClosed]);

	// Save automatically as soon as the user reaches the final page.
	useEffect(() => {
		if (autoSaveStartedRef.current) return;
		if (!state.isInitialized || !state.signupUuid || signupsClosed) return;

		autoSaveStartedRef.current = true;
		saveSignup();
	}, [state.isInitialized, state.signupUuid, signupsClosed, saveSignup]);

	const copyToClipboard = useCallback(() => {
		selectTextArea();
		const copied = document.execCommand('copy');
		if (copied) {
			setIsDirty(false);
		}
		return copied;
	}, [selectTextArea]);

	const handleCopyAndPost = useCallback(() => {
		copyToClipboard();

		if (saveStatus === "error") {
			saveSignup();
		}

		if (activeEvent.signupThreadUrl) {
			window.open(activeEvent.signupThreadUrl, '_blank');
		} else {
			alert("The signup thread URL is not configured for this event. The code has been copied — please post it manually.");
		}
	}, [copyToClipboard, saveStatus, saveSignup, activeEvent.signupThreadUrl]);

	const handleBack = () => {
		navigate("../additional-info");
	};

	const handleReset = () => {
		if (window.confirm("Are you sure you want to reset the form? All progress will be lost.")) {
			dispatch({ type: "RESET" });
			navigate("../");
		}
	};

	const statusAlert = (() => {
		if (signupsClosed) {
			return (
				<Alert severity="warning">
					Signups are currently closed. You can still copy the code for your own records, but
					it will not be verified or included in the event.
				</Alert>
			);
		}

		if (saveStatus === "saving") {
			return <Alert severity="info">Saving your form...</Alert>;
		}

		if (saveStatus === "error") {
			return <Alert severity="error">{saveMessage}</Alert>;
		}

		if (saveStatus === "saved") {
			return (
				<Alert
					severity="success"
					action={isVerified
						? <Chip label="Verified" color="success" size="small" />
						: <Chip label="Pending admin verification" color="warning" size="small" />
					}
				>
					{saveMessage}
				</Alert>
			);
		}

		return null;
	})();

	return (
		<div className="finishPage">
			<div className="container-fluid" style={{ maxWidth: 970 + 'px' }}>
				<h1><strong>FORM COMPLETE!</strong></h1>
			</div>
			<div className="container-fluid" style={{ maxWidth: 970 + 'px', marginBottom: 2 + '%' }}>
				<p align="left">
					Copy your completed form below and paste it to the forums on our sign
					up thread. An admin will verify your post before your signup is added
					to the event.<br />
					(Please <strong>do not change the code at the bottom</strong>)
				</p>
				{statusAlert}
			</div>
			<div className="container-fluid" style={{ maxWidth: 970 + 'px' }}>
				<div className="md-form">
					<textarea
						ref={textAreaRef}
						value={finalText}
						id="completeForm"
						className="md-textarea form-control"
						rows="10"
						style={{ maxWidth: 970 + 'px' }}
						onClick={selectTextArea}
						readOnly
					/>
				</div>
				<div style={{ paddingTop: 2 + '%' }}>
					<Button variant="contained" onClick={handleCopyAndPost}>
						Copy and Post
					</Button>
				</div>
			</div>

			<Box sx={{ width: '100%', mt: 4, mb: 8 }}>
				<Box sx={{ maxWidth: '970px', margin: '0 auto', px: 2 }}>
					<Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
						<Button
							color="inherit"
							variant="outlined"
							onClick={handleBack}
							sx={{ mr: 1 }}
						>
							Back
						</Button>
						<Box sx={{ flex: '1 1 auto' }} />

						<Button
							variant="outlined"
							color="error"
							onClick={handleReset}
						>
							RESET
						</Button>
					</Box>
				</Box>
			</Box>
		</div>
	);
}
