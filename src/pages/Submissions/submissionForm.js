import React, { useState, useEffect, useContext } from 'react';
import { useSelector } from "react-redux";
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from "@mui/material/TextField";
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Button from "@mui/material/Button";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';

import NavButton from "../../components/navbutton";
import { EventContext } from '../../context/EventContext';
import ImageCarousel from "../../components/ImageCarousel";

const ACCEPTED_FILE_TYPES = ["apng", "avif", "gif", "jpeg", "jpg", "png", "svg", "webp"];

export default function SubmissionForm() {
	const { activeEvent } = useContext(EventContext);
	const submissionUuidToLoad = useSelector(state => state.formState.uuid);

	const [participants, setParticipants] = useState([]);
	const [tags, setTags] = useState([]);
	const [selectedImageIndex, setSelectedImageIndex] = useState(0);

	const [state, setState] = useState({
		editingSubmission: !!submissionUuidToLoad && submissionUuidToLoad !== "",
		connected: false,
		recipientEditable: false,
		recipientLoading: false,
		isPrimaryRecipient: false,
		useMatchupRecipient: false,
		validImageFileType: "",
		messageTooLong: false,
		loadingSubmit: false,
		alertOpen: false,
		alertMessage: "",
		submitted: false,
		uuid: "",
		username: "",
		recipient: "",
		imageUrl: "",
		altLinks: [], // Array of strings
		selectedTags: [], // Array of strings
		message: "",
		note: "",
		anonymous: false,
	});



	useEffect(() => {
		if (activeEvent) {
			setTags(activeEvent.tags || []);

			// Fetch participants
			axios.get(`/api/participants?eventId=${activeEvent._id}`).then(res => {
				setParticipants(res.data.participants);
				setState(prev => ({ ...prev, connected: true }));
			});
		}
	}, [activeEvent]);

	useEffect(() => {
		if (state.editingSubmission && submissionUuidToLoad) {
			axios.get(`/api/submission?uuid=${submissionUuidToLoad}`).then(res => {
				const data = res.data;
				setState(prev => ({
					...prev,
					...data,
					recipientEditable: true, // Allow editing recipient on load? Or maybe check logic again.
					// If they are editing, they might have already submitted, so recipient should be editable.
					selectedTags: data.tags || [],
					altLinks: data.altLinks || []
				}));
			});
		}
	}, [state.editingSubmission, submissionUuidToLoad]);


	const handleClose = () => {
		if (state.submitted) {
			return;
		}
		setState(prev => ({ ...prev, alertOpen: false }));
	};

	const setUserName = (e, newValue) => {
		setState(prev => ({ ...prev, username: newValue, recipientLoading: true }));

		if (!newValue) {
			setState(prev => ({ ...prev, recipientLoading: false }));
			return;
		}

		axios.get(`/api/hasSubmitted?name=${newValue}`).then(res => {
			if (res.data.hasSubmitted) {
				// User has submitted before. Allow them to choose a recipient (not themselves).
				setState(prev => ({
					...prev,
					recipientEditable: true,
					recipientLoading: false,
					isPrimaryRecipient: false,
					useMatchupRecipient: false,
					recipient: "" // Reset recipient so they have to choose
				}));
			} else {
				// First time submitting. Auto-assign main recipient securely.
				setState(prev => ({
					...prev,
					recipient: "Submitting for your main recipient!",
					recipientLoading: false,
					isPrimaryRecipient: true,
					recipientEditable: false,
					useMatchupRecipient: true
				}));
			}
		});
	};

	const setRecipient = (e, newValue) => {
		setState(prev => ({ ...prev, recipient: newValue }));
	};

	const setTagsSelection = (e, newValue) => {
		setState(prev => ({ ...prev, selectedTags: newValue }));
	};





	const setMessage = (e) => {
		const text = e.target.value;
		const tooLong = text.length > 300;
		setState(prev => ({ ...prev, message: text, messageTooLong: tooLong }));
	};

	const setNote = (e) => {
		setState(prev => ({ ...prev, note: e.target.value }));
	};

	const handleAnonChange = () => {
		setState(prev => ({ ...prev, anonymous: !prev.anonymous }));
	};

	const submitArt = () => {
		let errors = "";
		if (!state.username) errors += "Username required. ";
		if (!state.useMatchupRecipient && !state.recipient) errors += "Recipient required. ";
		if (!state.imageUrl) errors += "Image URL required. ";
		if (state.selectedTags.length === 0) errors += "At least one tag required. ";

		if (errors !== "") {
			setState(prev => ({ ...prev, alertMessage: errors, alertOpen: true }));
		} else {
			const payload = {
				username: state.username,
				recipient: state.useMatchupRecipient ? null : state.recipient,
				useMatchupRecipient: state.useMatchupRecipient,
				imageUrl: state.imageUrl,
				altLinks: state.altLinks.filter(link => link && link.trim() !== ""),
				tags: state.selectedTags.map(t => typeof t === 'string' ? t : t.name), // Handle object tags if needed
				message: state.message,
				note: state.note,
				anonymous: state.anonymous,
			};

			if (state.editingSubmission) {
				setState(prev => ({ ...prev, loadingSubmit: true }));
				const submissionUuid = state.uuid || submissionUuidToLoad;
				axios.put(`/api/submit?uuid=${submissionUuid}`, payload).then(() => {
					// Update local storage if we still use it for history?
					// Maybe just rely on the UUID.
					let submissions = JSON.parse(localStorage.getItem("submissions")) || [];
					let existingSub = submissions.find(s => s.uuid === state.uuid);
					if (existingSub) {
						existingSub.imageUrl = state.imageUrl;
						localStorage.setItem("submissions", JSON.stringify(submissions));
					}

					setState(prev => ({
						...prev,
						alertMessage: "Submission updated! To edit this submission again, use the code: " + state.uuid,
						submitted: true,
						loadingSubmit: false,
						alertOpen: true
					}));
				});
			} else {
				const uuid = uuidv4();
				setState(prev => ({ ...prev, loadingSubmit: true, uuid: uuid }));
				payload.uuid = uuid;

				axios.post("/api/submit", payload).then(() => {
					let submissions = JSON.parse(localStorage.getItem("submissions")) || [];
					submissions.push({ "uuid": uuid, "imageUrl": state.imageUrl, "eventId": activeEvent._id });
					localStorage.setItem("submissions", JSON.stringify(submissions));

					setState(prev => ({
						...prev,
						alertMessage: "Submission complete! To edit this submission, use the code: " + uuid,
						submitted: true,
						loadingSubmit: false,
						alertOpen: true
					}));
				}).catch((err) => {
					console.warn(err);
					setState(prev => ({
						...prev,
						alertMessage: "Submission failed! :(\nError:\n" + (err.response?.data?.error || err.message),
						loadingSubmit: false,
						alertOpen: true
					}));
				});
			}
		}
	};

	return (
		<div className="submissionPage">
			<div className="container-fluid" style={{ maxWidth: 970 + 'px' }}>
				<h1><strong>FR SECRET SANTA ART SUBMISSION</strong></h1>
			</div>
			<div className="container-fluid" style={{ maxWidth: 970 + 'px' }}>
				<p align="left">
					Congratulations on finishing your beautiful artwork! Please upload your art to a private site such as
					&nbsp;<a href={"https://imgur.com/upload"}>https://imgur.com/upload</a>&nbsp;
					and copy the link to the image in order to keep the element of surprise!
					NOTE: PLEASE <strong>DO NOT USE DISCORD</strong>. Discord has discontinued perma-links to images.
					<br /><br />
					(If you are a traditional artist who wants one of us to touch up your artwork, please do not submit this
					form yet! Instead, <a href={"https://www1.flightrising.com/msgs/new?to=Hexlash"}>private message Hex</a> a
					link to your artwork and I'll send you back a link to the edited
					version so you can submit this form.)
					<br /><br />
					You are free to submit multiple times after you have completed your primary piece.
					<br /><br />
					If you have any questions or issues with the form, please PM us or ping us on the <a
						href={activeEvent?.threadUrl}>thread</a>!
					<br /><br />
					Thank you for taking part in this event, and we hope to see you again next year!
				</p>
			</div>
			{
				state.connected ? (
					<div className="container-fluid" style={{ maxWidth: 970 + 'px', paddingTop: 2 + '%' }}>
						<div id="username-field">
							<p align="left" style={{ paddingBottom: 1 + '%' }}><strong>Username</strong></p>
							<form className="container-fluid">
								<Autocomplete
									onChange={(e, newValue) => setUserName(e, newValue)}
									disablePortal
									autoHighlight
									value={state.username}
									id="username-box"
									options={state.connected ? participants : []}
									renderInput={(params) =>
										<TextField {...params} required variant="filled" label="Your Username" />}
								/>
							</form>
						</div>

						<div id="recipient-field" style={{ paddingTop: 2 + '%' }}>
							<p align="left" style={{ paddingBottom: 1 + '%' }}><strong>Recipient</strong></p>
							{state.recipientLoading ? (<Box><CircularProgress /></Box>) : (
								<form className="container-fluid">
									{state.useMatchupRecipient ? (
										<TextField
											disabled
											fullWidth
											variant="filled"
											value={state.recipient}
											label="Recipient"
											helperText="We will automatically route this to your assigned recipient!"
										/>
									) : (
										<Autocomplete
											onChange={(e, newValue) => setRecipient(e, newValue)}
											disabled={!state.recipientEditable}
											disablePortal
											autoHighlight
											value={state.recipient}
											id="recipient-box"
											options={state.connected ? participants.filter(p => p !== state.username) : []}
											renderInput={(params) =>
												<TextField {...params}
													required
													variant="filled"
													helperText={state.isPrimaryRecipient ? "If you wish to submit for someone else, complete this current submission and then start a new one." : ""}
													label={state.recipientEditable ? "Your Recipient" : "(Please enter your username to begin)"} />}
										/>
									)}
								</form>
							)}
						</div>

						<div id="image-field" style={{ paddingTop: 2 + '%' }}>
							<p align="left" style={{ paddingBottom: 1 + '%' }}><strong>Art</strong></p>

							<Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
								<ImageCarousel
									images={[state.imageUrl || "", ...state.altLinks]}
									selectedIndex={selectedImageIndex}
									onIndexChange={setSelectedImageIndex}
								/>
							</Box>

							<Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
								<TextField
									fullWidth
									label={selectedImageIndex === 0 ? "Main Image URL" : `Alternate Image ${selectedImageIndex} URL`}
									value={selectedImageIndex === 0 ? state.imageUrl : state.altLinks[selectedImageIndex - 1] || ""}
									error={selectedImageIndex === 0 && !!state.validImageFileType}
									helperText={selectedImageIndex === 0 ? (state.validImageFileType || "Direct link to image (png, jpg, etc)") : "Direct link to image"}
									onChange={(e) => {
										const val = e.target.value;
										if (selectedImageIndex === 0) {
											let errorText = "";
											if (!ACCEPTED_FILE_TYPES.some(s => val.toLowerCase().endsWith(s))) {
												errorText = "Requires URL ending in: apng, avif, gif, jpeg, jpg, png, svg, or webp";
											}
											if (val.includes('cdn.discordapp.com/attachments/')) {
												errorText = errorText + ". Discord links aren't supported!";
											}
											setState(prev => ({ ...prev, imageUrl: val, validImageFileType: errorText === "" ? undefined : errorText }));
										} else {
											const newAltLinks = [...state.altLinks];
											newAltLinks[selectedImageIndex - 1] = val;
											setState(prev => ({ ...prev, altLinks: newAltLinks }));
										}
									}}
									variant="filled"
								/>
							</Box>

							<Stack direction="row" spacing={2} justifyContent="center">
								<Button
									variant="contained"
									startIcon={<AddPhotoAlternateIcon />}
									onClick={() => {
										setState(prev => ({ ...prev, altLinks: [...prev.altLinks, ""] }));
										setSelectedImageIndex(state.altLinks.length + 1);
									}}
								>
									Add New Image
								</Button>
								<Button
									variant="outlined"
									color="error"
									startIcon={<DeleteIcon />}
									disabled={selectedImageIndex === 0 && !state.imageUrl}
									onClick={() => {
										if (selectedImageIndex === 0) {
											setState(prev => ({ ...prev, imageUrl: "" }));
										} else {
											const newAltLinks = state.altLinks.filter((_, i) => i !== selectedImageIndex - 1);
											setState(prev => ({ ...prev, altLinks: newAltLinks }));
											setSelectedImageIndex(Math.max(0, selectedImageIndex - 1));
										}
									}}
								>
									{selectedImageIndex === 0 ? "Clear Main Image" : "Delete Current Image"}
								</Button>
							</Stack>
						</div>

						<div id="tags-field" style={{ paddingTop: 2 + '%' }}>
							<p align="left" style={{ paddingBottom: 1 + '%' }}><strong>Tags</strong></p>
							<Autocomplete
								multiple
								onChange={(e, newValue) => setTagsSelection(e, newValue)}
								disablePortal
								autoHighlight
								value={state.selectedTags}
								id="tags-box"
								options={tags.map(t => t.name)}
								freeSolo
								renderTags={(value, getTagProps) =>
									value.map((option, index) => (
										<Chip variant="outlined" label={option} {...getTagProps({ index })} />
									))
								}
								renderInput={(params) =>
									<TextField
										{...params}
										required
										variant="filled"
										helperText="Choose tags that best represent this art."
										label="Tags" />}
							/>
						</div>

						<div id="message-field" style={{ paddingTop: 2 + '%' }}>
							<p align="left" style={{ paddingBottom: 1 + '%' }}><strong>Holiday Message</strong> (Optional)</p>
							<TextField
								id="outlined-basic"
								label="Holiday Message"
								value={state.message}
								error={state.messageTooLong}
								helperText={"Little message to your recipient! " + state.message.length + "/300"}
								minRows={4}
								onChange={event => setMessage(event)}
								fullWidth
								multiline
								variant="filled" />
						</div>

						<div id="note-field" style={{ paddingTop: 2 + '%' }}>
							<p align="left" style={{ paddingBottom: 1 + '%' }}><strong>Private Note</strong> (Optional)</p>
							<TextField
								id="outlined-basic"
								label="Private Note to Organizers"
								value={state.note}
								helperText={"Anything you would like the organizers to know!"}
								minRows={4}
								onChange={event => setNote(event)}
								fullWidth
								multiline
								variant="filled" />
						</div>

						<form className="row justify-content-center" style={{ maxWidth: 970 + 'px' }}>
							<div className="row container justify-content-center">

								<div className="form-check form-check-inline">
									<FormGroup>
										<FormControlLabel control={<Checkbox onChange={event => handleAnonChange(event)}
											checked={state.anonymous} />}
											label="Remain anonymous for this submission." />
									</FormGroup>
								</div>
							</div>
							<br />
							<div
								className="d-flex justify-content-between container navBtns"
								style={{ maxWidth: 970 + 'px' }}
							>
								<div className="col d-flex justify-content-start">
									<NavButton
										navTo="submissions"
										type={""}
										text={"Back"}
									/>
								</div>
								<div className="col d-flex justify-content-end">
									<Button
										id="submit-art-btn"
										onClick={(e) => submitArt(e)}
										variant="contained"
										endIcon={<SendIcon />}
										disabled={
											!state.username ||
											(!state.useMatchupRecipient && !state.recipient) ||
											!state.imageUrl ||
											state.selectedTags.length === 0 ||
											state.messageTooLong ||
											(state.validImageFileType !== undefined && state.validImageFileType !== "")
										}
									>
										{state.loadingSubmit ? <CircularProgress /> : state.editingSubmission ? "Update" : "Submit!"}
									</Button>
								</div>
							</div>
						</form>
					</div>
				) : (<div className="container-fluid" style={{ maxWidth: 970 + 'px', paddingTop: 2 + '%' }}>
					<Box><CircularProgress /></Box>
				</div>)
			}
			<Dialog
				open={state.alertOpen}
				onClose={() => handleClose()}
				aria-labelledby="alert-dialog-title"
				aria-describedby="alert-dialog-description"
			>
				<DialogTitle id="alert-dialog-title">
					Submission Alert
				</DialogTitle>
				<DialogContent>
					<DialogContentText id="alert-dialog-description">
						{state.alertMessage}
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					{state.submitted ? (<NavButton
						navTo="submissions"
						type={""}
						text={"Done!"}
						passThrough={{
							color: "success",
							variant: "contained"
						}}
					/>) : (<Button onClick={(e) => handleClose(e)}>Okay</Button>)}

				</DialogActions>
			</Dialog>
		</div>
	);
}

