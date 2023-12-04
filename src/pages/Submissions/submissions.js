import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {useDispatch} from 'react-redux'

import CONFIG from "../../config/CONFIG.json";

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
import {Grid} from "@mui/material";

export default function Submissions() {
	const navigate = useNavigate();
	const dispatch = useDispatch();

	const [open, setOpen] = useState(false);
	const [existingSubmissions, setExistingSubmissions] = useState(false);
	const [submissionCards, setSubmissionCards] = useState([]);
	const [uuidText, setUuidText] = useState("");

	const regexExp = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi

	const handleClose = () => {
		setOpen(false);
	};

	function handleNewSubmissionClick() {
		dispatch({type: "SET_UUID", payload: {"uuid": ""}});
		navigate("/submissionForm");
	}

	function loadSubmission(uuid) {
		dispatch({type: "SET_UUID", payload: {"uuid": uuid}});
		navigate("/submissionForm");
	}

	function codeIsCorrect() {
		if (uuidText === "") {
			return true;
		}
		return regexExp.test(uuidText);
	}

	useEffect(() => {
		let submissions = JSON.parse(localStorage.getItem("submissions"));

		if (submissions !== null) {
			setExistingSubmissions(true);

			if (!Array.isArray(submissions)) {
				submissions = [];
			}
			submissions = submissions.filter((submission) => submission.year && submission.year === CONFIG.currentYear);
			localStorage.setItem("submissions", JSON.stringify(submissions));

			let submissionCardsTemp = [];

			submissions.forEach(submission => submissionCardsTemp.push(
					<div style={{paddingBottom: 2 + "%"}}>
						<Card sx={{minWidth: 200, minHeight: 200, maxWidth: 345, maxHeight: 345}}>
							<CardActionArea sx={{minWidth: 200, minHeight: 200, maxWidth: 345, maxHeight: 345, height: 100 + '%'}} onClick={() => loadSubmission(submission.uuid)}>
								<CardMedia
										component="img"
										image={submission.imageUrl}
								/>
							</CardActionArea>
						</Card>
					</div>
			))

			setSubmissionCards(submissionCardsTemp);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
			<div className="submissionsPage">
				<div className="container-fluid" style={{maxWidth: 970 + 'px', paddingTop: 2 + "%"}}>
					<h1 style={{margin: 0}}><strong>SUBMISSIONS</strong></h1>
				</div>
				<div className="container-fluid" style={{paddingTop: 2 + '%'}}>
					<p style={{maxWidth: 750 + 'px'}}>
						Create a new submission or load one with a code!
					</p>
				</div>
				<br/>
				<div className="row justify-content-center">
					<div className={"col-md-auto"}>
						<Button
								id="submit-art-btn"
								onClick={uuidText === "" ? handleNewSubmissionClick : () => loadSubmission(uuidText)}
								variant="contained"
						>
							{uuidText === "" ? "New" : "Edit"} Submission
						</Button>
					</div>
					<div className={"col-md-auto"}>
						<TextField
								fullWidth
								error={codeIsCorrect() ? undefined : true}
								helperText={codeIsCorrect() ? undefined : "This code is malformed. (for some reason this text may not go away even if the code is correct but its almost 5am again and idek what it's doing)"}
								onChange={e => setUuidText(e.target.value)}
								id="uuid-field"
								label="Load Existing Submission Code"
								variant="filled"/>
					</div>
				</div>
				{existingSubmissions ? (
						<div>
							<div className="container-fluid" style={{maxWidth: 970 + 'px', paddingTop: 2 + '%'}}>
								<p align="left" style={{paddingBottom: 1 + '%'}}><strong>Previous Submissions</strong></p>
								<p align="left">Edit any of your previous submissions by clicking/tapping on the cards below:</p>
							</div>
							<div className="container-fluid" style={{maxWidth: 90 + '%', paddingTop: 2 + "%"}}>
								<Grid
										container
										direction="row"
										justify="flex-start"
										alignItems="flex-start"
										sx={{"justify-content": "space-around"}}
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
