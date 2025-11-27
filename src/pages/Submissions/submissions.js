import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from 'react-redux'

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import CardActionArea from "@mui/material/CardActionArea";
import CardMedia from "@mui/material/CardMedia";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import { Grid, Stack } from "@mui/material";

import { EventContext } from '../../context/EventContext';

export default function Submissions() {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const { activeEvent } = useContext(EventContext);

	const [open, setOpen] = useState(false);
	const [existingSubmissions, setExistingSubmissions] = useState(false);
	const [submissionCards, setSubmissionCards] = useState([]);
	const [uuidText, setUuidText] = useState("");

	const regexExp = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/gi

	const handleClose = () => {
		setOpen(false);
	};

	function handleNewSubmissionClick() {
		dispatch({ type: "SET_UUID", payload: { "uuid": "" } });
		navigate("/submit");
	}

	function loadSubmission(uuid) {
		dispatch({ type: "SET_UUID", payload: { "uuid": uuid } });
		navigate("/submit");
	}

	function codeIsCorrect() {
		if (uuidText === "") {
			return true;
		}
		return regexExp.test(uuidText);
	}

	useEffect(() => {
		let submissions = JSON.parse(localStorage.getItem("submissions"));

		if (submissions !== null && activeEvent) {
			setExistingSubmissions(true);

			if (!Array.isArray(submissions)) {
				submissions = [];
			}
			// Filter by active event ID
			submissions = submissions.filter((submission) => submission.eventId === activeEvent._id);
			localStorage.setItem("submissions", JSON.stringify(submissions));

			let submissionCardsTemp = [];

			submissions.forEach(submission => submissionCardsTemp.push(
				<div style={{ paddingBottom: 2 + "%" }} key={submission.uuid}>
					<Card sx={{ minWidth: 200, minHeight: 200, maxWidth: 345, maxHeight: 345 }}>
						<CardActionArea sx={{ minWidth: 200, minHeight: 200, maxWidth: 345, maxHeight: 345, height: 100 + '%' }} onClick={() => loadSubmission(submission.uuid)}>
							<CardMedia
								component="img"
								image={submission.imageUrl}
								alt="Submission Thumbnail"
							/>
						</CardActionArea>
					</Card>
				</div>
			))

			setSubmissionCards(submissionCardsTemp);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeEvent]);

	return (
		<div className="submissionsPage">
			<div className="container-fluid" style={{ maxWidth: 970 + 'px', paddingTop: 2 + "%" }}>
				<h1 style={{ margin: 0 }}><strong>SUBMISSIONS</strong></h1>
			</div>
			<div className="container-fluid" style={{ paddingTop: 2 + '%' }}>
				<p style={{ maxWidth: 750 + 'px' }}>
					Create a new submission or load one with a code!
				</p>
			</div>
			<br />
			<div className="row justify-content-center">
				<Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="center">
					<TextField
						sx={{ minWidth: '300px' }}
						error={!codeIsCorrect()}
						helperText={!codeIsCorrect() ? "This code is malformed." : ""}
						onChange={e => setUuidText(e.target.value)}
						id="uuid-field"
						label="Submission Code"
						variant="filled" />
					<Button
						id="submit-art-btn"
						onClick={uuidText === "" ? handleNewSubmissionClick : () => loadSubmission(uuidText)}
						variant="contained"
						disabled={uuidText !== "" && !codeIsCorrect()}
						sx={{ height: '56px' }}
					>
						{uuidText === "" ? "Start New Submission" : "Load Submission"}
					</Button>
				</Stack>
			</div>
			{existingSubmissions ? (
				<div>
					<div className="container-fluid" style={{ maxWidth: 970 + 'px', paddingTop: 2 + '%' }}>
						<p align="left" style={{ paddingBottom: 1 + '%' }}><strong>Previous Submissions</strong></p>
						<p align="left">Edit any of your previous submissions by clicking/tapping on the cards below:</p>
					</div>
					<div className="container-fluid" style={{ maxWidth: 90 + '%', paddingTop: 2 + "%" }}>
						<Grid
							container
							direction="row"
							justifyContent="space-around"
							alignItems="flex-start"
						>
							{submissionCards}
						</Grid>
					</div>
				</div>
			) : undefined}
			<Dialog
				open={open}
				onClose={handleClose}
				aria-labelledby="alert-dialog-title"
				aria-describedby="alert-dialog-description"
			>
				<DialogTitle id="alert-dialog-title">
					No Matching Submission Found.
				</DialogTitle>
				<DialogContent>
					<DialogContentText id="alert-dialog-description">
						Unable to find a matching submission for the id: "". Double check you have the right ID or reach out to
						Hex.
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose} autoFocus>
						Ok
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
}
