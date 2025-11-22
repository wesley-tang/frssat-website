import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';

import { useActiveEventContext } from "../../context/EventContext";
import { useSignupContext } from "../../context/SignupContext";

export default function Finish() {
	// --- State Hooks ---
	const [isDirty, setIsDirty] = useState(true);
	const [isVerified, setIsVerified] = useState(false);
	const [updateStatus, setUpdateStatus] = useState("idle"); // idle, updating, success, error

	// Modal State
	const [modalOpen, setModalOpen] = useState(false);
	const [modalStep, setModalStep] = useState(1); // 1: Pre-flight, 2: Verification
	const [agreedToVerify, setAgreedToVerify] = useState(false);
	const [postUrl, setPostUrl] = useState("");
	const [verificationStatus, setVerificationStatus] = useState("idle"); // idle, verifying, success, error
	const [verificationMessage, setVerificationMessage] = useState("");

	const { state, dispatch, generateFinalText } = useSignupContext();
	const { activeEvent } = useActiveEventContext();
	const navigate = useNavigate();

	const textAreaRef = useRef(null);
	const finalText = generateFinalText();

	// --- Lifecycle Hooks ---
	// Check verification status on mount
	useEffect(() => {
		if (state.signupUuid) {
			axios.get(`/api/checkSignupStatus?uuid=${state.signupUuid}`)
				.then(response => {
					if (response.data.verified) {
						setIsVerified(true);
					}
				})
				.catch(error => {
					console.error("Error checking signup status:", error);
				});
		}
	}, [state.signupUuid]);

	useEffect(() => {
		const handleBeforeUnload = (event) => {
			if (isDirty) {
				event.preventDefault();
				event.returnValue = "Are you sure? You have not finished your form yet and leaving will lose your progress.";
				return event.returnValue;
			}
		};

		window.addEventListener('beforeunload', handleBeforeUnload);

		const textarea = textAreaRef.current;
		const handleCopy = () => {
			setIsDirty(false);
		};

		if (textarea) {
			textarea.addEventListener('copy', handleCopy);
		}

		return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
			if (textarea) {
				textarea.removeEventListener('copy', handleCopy);
			}
		};
	}, [isDirty]);

	// --- Event Handlers ---
	const selectTextArea = useCallback(() => {
		if (textAreaRef.current) {
			textAreaRef.current.select();
			textAreaRef.current.setSelectionRange(0, 99999);
		}
	}, []);

	const handleUpdateClick = useCallback(() => {
		setUpdateStatus("updating");
		axios.post('/api/updateSignup', {
			...state,
			eventId: activeEvent._id
		})
			.then(response => {
				setUpdateStatus("success");
				alert("Signup updated successfully! You can now update your post on the forums.");
			})
			.catch(error => {
				console.error("Error updating signup:", error);
				setUpdateStatus("error");
				alert("Failed to update signup. Please try again.");
			});
	}, [state, activeEvent._id]);

	const handleCopyClick = useCallback(() => {
		selectTextArea();
		document.execCommand('copy');
		setIsDirty(false);

		if (isVerified) {
			handleUpdateClick();
		} else {
			setModalOpen(true);
			setModalStep(1);
		}
	}, [selectTextArea, isVerified, handleUpdateClick]);

	const handleGoToForums = useCallback(() => {
		window.open(activeEvent.signupThreadUrl, '_blank');
		setModalStep(2);
	}, [activeEvent.signupThreadUrl]);

	const handleVerify = useCallback(() => {
		setVerificationStatus("verifying");
		setVerificationMessage("Verifying your post...");

		axios.post('/api/verifySignup', {
			...state,
			postUrl: postUrl,
			eventId: activeEvent._id
		})
			.then(response => {
				setVerificationStatus("success");
				setVerificationMessage(`Success! Verified as ${response.data.username} (ID: ${response.data.userId})`);
				setIsVerified(true);
				setTimeout(() => {
					setModalOpen(false);
				}, 2000);
			})
			.catch(error => {
				console.error("Verification failed:", error);
				setVerificationStatus("error");
				setVerificationMessage(`${error.response?.data?.error || "Failed to verify. Please check the URL and try again."} If you continue to have issues, please feel free to reach out to Hex.`);
			});
	}, [postUrl, state, activeEvent._id]);

	const handleCloseModal = () => {
		if (verificationStatus !== "success" && modalStep === 2) {
			if (!window.confirm("Are you sure you want to close? You must verify your signup for it to be recorded.")) {
				return;
			}
		}
		setModalOpen(false);
	};

	const handleBack = () => {
		navigate("../additional-info");
	};

	const handleReset = () => {
		if (window.confirm("Are you sure you want to reset the form? All progress will be lost.")) {
			dispatch({ type: "RESET" });
			navigate("../additional-info");
		}
	};

	return (
		<div className="finishPage">
			<div className="container-fluid" style={{ maxWidth: 970 + 'px' }}>
				<h1><strong>FORM COMPLETE!</strong></h1>
			</div>
			<div className="container-fluid" style={{ maxWidth: 970 + 'px', marginBottom: 2 + '%' }}>
				<p align="left">
					Copy your completed form below and paste it to the forums on our sign
					up thread. If you need to edit fields in red, please redo the form.<br />
					(Please <strong> do not change the
						the code at the bottom</strong>)
				</p>
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
					<Button
						className="row justify-content-center"
						variant="contained"
						onClick={handleCopyClick}
						disabled={updateStatus === "updating"}
					>
						{updateStatus === "updating" ? "Updating..." : `Copy and ${isVerified ? "Update" : "Verify"}`}
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
							sx={{ mr: isVerified ? 2 : 0 }}
						>
							RESET
						</Button>

						{isVerified && (
							<Button
								onClick={handleGoToForums}
								variant="contained"
								color="success"
							>
								Go to Forums
							</Button>
						)}
					</Box>
				</Box>
			</Box>

			<Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
				<DialogTitle>
					{modalStep === 1 ? "One Last Step!" : "Verify Your Signup"}
				</DialogTitle>
				<DialogContent>
					{modalStep === 1 ? (
						<>
							<DialogContentText gutterBottom>
								You've copied your signup form! Now you must post it to the Flight Rising forums and then copy the link to your post!
							</DialogContentText>
							<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 2 }}>
								<img src="https://i.imgur.com/pMnn8W3.png" alt="Forum post link button" style={{ maxWidth: '100%', border: '1px solid #ccc' }} />
								<DialogContentText variant="caption" sx={{ mt: 1 }}>
									On the forums, click this button to get your post link!
								</DialogContentText>
							</Box>
							<DialogContentText sx={{ fontWeight: 'bold', color: 'red', mt: 2 }}>
								IMPORTANT: Your signup is NOT recorded until you verify your post in the next step.
							</DialogContentText>
							<FormControlLabel
								control={
									<Checkbox
										checked={agreedToVerify}
										onChange={(e) => setAgreedToVerify(e.target.checked)}
									/>
								}
								label="I understand that I must verify my signup for it to be valid."
								sx={{ mt: 2 }}
							/>
						</>
					) : (
						<>
							<DialogContentText gutterBottom>
								Paste the link to your forum post below to verify your signup.
							</DialogContentText>
							<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 2 }}>
								<img src="https://i.imgur.com/pMnn8W3.png" alt="Forum post link button" style={{ maxWidth: '100%', border: '1px solid #ccc' }} />
								<DialogContentText variant="caption" sx={{ mt: 1 }}>
									On the forums, click this button to get your post link!
								</DialogContentText>
							</Box>
							<TextField
								autoFocus
								margin="dense"
								id="postUrl"
								label="Forum Post URL"
								type="url"
								fullWidth
								variant="outlined"
								value={postUrl}
								onChange={(e) => setPostUrl(e.target.value)}
								placeholder="https://www1.flightrising.com/forums/cc/..."
								disabled={verificationStatus === "success"}
							/>
							{verificationMessage && (
								<DialogContentText
									sx={{
										mt: 2,
										color: verificationStatus === "success" ? "green" : verificationStatus === "error" ? "red" : "text.primary",
										fontWeight: 'bold'
									}}
								>
									{verificationMessage}
								</DialogContentText>
							)}
						</>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseModal} color="inherit">
						Cancel
					</Button>
					{modalStep === 1 ? (
						<Button
							onClick={handleGoToForums}
							variant="contained"
							color="success"
							disabled={!agreedToVerify}
						>
							Go to Forums
						</Button>
					) : (
						<Button
							onClick={handleVerify}
							variant="contained"
							color="secondary"
							disabled={!postUrl || verificationStatus === "verifying" || verificationStatus === "success"}
						>
							{verificationStatus === "verifying" ? "Verifying..." : "Verify"}
						</Button>
					)}
				</DialogActions>
			</Dialog>
		</div>
	);
}