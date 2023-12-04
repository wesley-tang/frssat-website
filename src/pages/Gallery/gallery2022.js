import {useEffect, useState} from "react";

import axios from 'axios';

import CONFIG from "../../config/CONFIG.json";

import CardActionArea from "@mui/material/CardActionArea";

import {ImageList, ImageListItem} from "@mui/material";
import Typography from "@mui/material/Typography";
import * as React from "react";
import useWindowDimensions from "../../components/useWindowDimensions";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Stack from "@mui/material/Stack";
import Modal from "react-bootstrap/Modal";


export default function Gallery() {
	const {width} = useWindowDimensions();

	const [open, setOpen] = useState(false);
	const [artLoaded, setArtLoaded] = useState(false);
	const [artCards, setArtCards] = useState([]);

	const [submissions, setSubmissions] = useState([]);
	const [currentArt, setCurrentArt] = useState({});

	const [usernameFilter, setUsernameFilter] = useState("");
	const [recipientFilter, setRecipientFilter] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("");

	const [participants, setParticipants] = useState([]);
	const [tags, setTags] = useState([]);


	const handleClose = () => setOpen(false);

	function openArtModal(submission) {
		setCurrentArt(submission);
		setOpen(true);
	}

	function setUserName(e, newValue) {
		if (newValue !== usernameFilter) {
			setUsernameFilter(newValue);
		}
	}

	function setRecipient(e, newValue) {
		if (newValue !== recipientFilter) {
			setRecipientFilter(newValue);
		}
	}

	function setCategory(e, newValue) {
		if (newValue !== categoryFilter) {
			setCategoryFilter(newValue);
		}
	}

	function applyFilters() {
		let filteredSubmissions = [...submissions];

		if (usernameFilter !== "" && usernameFilter !== null) {
			filteredSubmissions = filteredSubmissions.filter(submission => submission.username === usernameFilter);
		}
		if (recipientFilter !== "" && recipientFilter !== null) {
			filteredSubmissions = filteredSubmissions.filter(submission => submission.recipient === recipientFilter);
		}
		if (categoryFilter !== "" && categoryFilter !== null) {
			filteredSubmissions = filteredSubmissions.filter(submission => submission.category === categoryFilter);
		}

		return filteredSubmissions;
	}

	function renderCards(submissionsToRender) {
		const artCardsTemp = [];

		submissionsToRender.forEach(submission => artCardsTemp.push(
				<CardActionArea onClick={() => openArtModal(submission)}>
					<ImageListItem key={submission.imageUrl}>
						<img
								src={`${submission.imageUrl}?w=248&fit=crop&auto=format`}
								loading="lazy"
								alt={`${submission.username}'s art to ${submission.recipient}`}
						/>
					</ImageListItem>
				</CardActionArea>
		));

		return artCardsTemp;
	}

	useEffect(() => {
		const filtered = applyFilters();
		setArtCards(renderCards(filtered));

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [usernameFilter, recipientFilter, categoryFilter]);

	useEffect(() => {
		let tempTags = [];
		CONFIG.tags.forEach(tag => tempTags.push(tag.name));
		setTags(tempTags);

		axios.get(`/api/participants`, { params: { year: 2022 }}).then(res => {
			setParticipants(res.data.participants);

			axios.get('/api/submissions', { params: { year: 2022 }}).then(resSub => {
				setSubmissions(resSub.data.submissions);
				setArtCards(renderCards(resSub.data.submissions));
				setArtLoaded(true);
			});
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (

			<div className="galleryPage">
				<div className="container-fluid" style={{maxWidth: 970 + 'px', paddingTop: 2 + "%"}}>
					<h1 style={{margin: 0}}><strong>FRSSAT 2022 GALLERY</strong></h1>
				</div>
						<div className="container-fluid" style={{paddingTop: 2 + '%'}}>
							<div className="container-fluid" style={{paddingTop: 2 + '%'}}>
								<p style={{maxWidth: 750 + 'px'}}>
									Click/Tap on an image to view it in full with additional information! To find your own gifts, select your name in the "Filter by Recipient" box.
								</p>
							</div>
							<div className="container-fluid" style={{paddingTop: 2 + '%', paddingBottom: 4 + '%'}}>
								<Stack spacing={5}
								       direction={{ xs: 'column', sm: 'row' }}
								>
								<Autocomplete
										onChange={(e, newValue) => setUserName(e, newValue)}
										clearOnEscape
										fullWidth
										disablePortal
										id="username-box"
										options={artLoaded ? participants : []}
										renderInput={(params) =>
												<TextField {...params} label="Filter by Artist"/>}
								/>
								<Autocomplete
										onChange={(e, newValue) => setRecipient(e, newValue)}
										clearOnEscape
										fullWidth
										disablePortal
										id="recipient-box"
										options={artLoaded ? participants : []}
										renderInput={(params) =>
												<TextField {...params} label="Filter by Recipient"/>}
								/>

								<Autocomplete
										onChange={(e, newValue) => setCategory(e, newValue)}
										clearOnEscape
										fullWidth
										disablePortal
										id="category-box"
										options={tags}
										renderInput={(params) =>
												<TextField {...params} label="Filter by Category"/>}
								/>
							</Stack>
							</div>
							<div className="container-fluid">
								<ImageList variant="masonry" cols={width > 1300 ? 6 : width > 1000 ? 5 : width > 650 ? 4 : 3} gap={10}>
									{artCards}
								</ImageList>
							</div>
						</div>
				<Modal
						fullscreen
						show={open}
						onHide={handleClose}
				>
					<Modal.Header closeButton>
					</Modal.Header>
					<Modal.Body>
						<Stack direction={{ md: 'column', lg: 'row' }} spacing={7}>
							<img
									src={currentArt.imageUrl}
									style={{maxWidth: (width < 900 ? 100 : 75) + "%",  paddingTop: 2 + '%'}}
									alt={`${currentArt.username}'s art to ${currentArt.recipient}`}
							/>
							<div>
								<Typography id="modal-modal-description" sx={{mt: 2}}>
									From: <strong>{currentArt.username === "?" ? <i>anonymous</i> : currentArt.username}</strong>
									<br/>
									To: <strong>{currentArt.recipient}</strong>
									<br/>
								</Typography>
								{currentArt.message === "" ? undefined : (
										<div>
											<strong>Message:</strong>
											<p>
												{currentArt.message}
											</p>
										</div>
								)}
								{currentArt.altLinks === "" ? undefined : (
										<div>
											<br/>
											<strong>Alt versions:</strong>
											<p>
												(Will fix alt version rendering at a later date, sorry!)
											</p>
											<br/>
											{currentArt.altLinks}
										</div>
								)}
							</div>
						</Stack>
					</Modal.Body>
				</Modal>
			</div>
	)
			;
}