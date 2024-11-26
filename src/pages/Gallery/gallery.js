import * as React from "react";
import {useEffect, useState, useCallback} from "react";

import {useSearchParams} from 'react-router-dom';

import Modal from "react-bootstrap/Modal";

import axios from 'axios';
import { DateTime } from "luxon";
import CONFIG from "../../config/CONFIG.json";

import CardActionArea from "@mui/material/CardActionArea";
import {ImageList, ImageListItem, Paper} from "@mui/material";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import useWindowDimensions from "../../components/useWindowDimensions";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Stack from "@mui/material/Stack";


export default function Gallery() {
	const {width} = useWindowDimensions();

	const [open, setOpen] = useState(false);
	const [revealArt, setRevealArt] = useState(false);
	const [artLoaded, setArtLoaded] = useState(false);
	const [artCards, setArtCards] = useState([]);

	const [submissions, setSubmissions] = useState([]);
	const [countdownText, setCountDownText] = useState("--d --h --m --s");
	const [currentArt, setCurrentArt] = useState({});

	const [usernameFilter, setUsernameFilter] = useState("");
	const [recipientFilter, setRecipientFilter] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("");

	const [participants, setParticipants] = useState([]);
	const [tags, setTags] = useState([]);

	const [year, setYear] = useState(CONFIG.currentYear);

	const [searchParams] = useSearchParams();

	const handleClose = () => setOpen(false);

	const openArtModal = useCallback((submission) => {
		setCurrentArt(submission);
		setOpen(true);
	}, []);

	function countDownCalc(distance) {
		const days = Math.floor(distance / (1000 * 60 * 60 * 24));
		const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
		const seconds = Math.floor((distance % (1000 * 60)) / 1000);

		setCountDownText(days + "d " + hours + "h " + minutes + "m " + seconds + "s");
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

	const applyFilters = useCallback(() => {
		let filteredSubmissions = [...submissions];

		if (usernameFilter) {
			filteredSubmissions = filteredSubmissions.filter(submission => submission.username === usernameFilter);
		}
		if (recipientFilter) {
			filteredSubmissions = filteredSubmissions.filter(submission => submission.recipient === recipientFilter);
		}
		if (categoryFilter) {
			filteredSubmissions = filteredSubmissions.filter(submission => submission.category === categoryFilter);
		}

		return filteredSubmissions;
	}, [submissions, usernameFilter, recipientFilter, categoryFilter]);

	const renderCards = useCallback((submissionsToRender) => {
		return submissionsToRender.map(submission => (
				<CardActionArea key={submission.imageUrl} onClick={() => openArtModal(submission)}>
					<ImageListItem>
						<img
								src={`${submission.imageUrl}?w=248&fit=crop&auto=format`}
								loading="lazy"
								alt={`${submission.username}'s art to ${submission.recipient}`}
						/>
					</ImageListItem>
				</CardActionArea>
		));
	}, [openArtModal]);

	useEffect(() => {
		const filtered = applyFilters();
		setArtCards(renderCards(filtered));
	}, [applyFilters, renderCards]);


	function revealArtGallery() {
		setRevealArt(true);

		axios.get(`/api/participants`, { params: { year: year }}).then(res => {
			setParticipants(res.data.participants);

			axios.get('/api/submissions', { params: { year: year }}).then(resSub => {
				setSubmissions(resSub.data.submissions);
				setArtCards(renderCards(resSub.data.submissions));
				setArtLoaded(true);
			});
		});
	}

	useEffect(() => {
		let tempTags = [];
		CONFIG.tags.forEach(tag => tempTags.push(tag.name));
		setTags(tempTags);

		const paramYear = searchParams.get('year');
		if (paramYear && Number(paramYear) !== CONFIG.currentYear) {
			revealArtGallery();
			setYear(Number(paramYear));
		} else {
			prepareCountdownGallery();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const prepareCountdownGallery = () => {
		const endDate = new Date(CONFIG.endDate).getTime();

		axios.get("https://timeapi.io/api/time/current/zone?timeZone=America/Los_Angeles")
				.then(res => {
					return res.data ? new Date(res.data.dateTime) : null;
				})
				.catch(() => {
					return DateTime.now().setZone("America/Los_Angeles").toJSDate();
				})
				.then(currentDate => {
					if (!currentDate) {
						throw new Error("Failed to fetch or calculate the current date");
					}

					if (currentDate.getTime() >= endDate) {
						revealArtGallery();
					} else {
						const countdown = setInterval(() => {
							const currentLA = DateTime.now().setZone("America/Los_Angeles");
							const distance = endDate - currentLA.toMillis();

							countDownCalc(distance);

							if (distance < 0) {
								clearInterval(countdown);
								revealArtGallery();
							}
						}, 1000);
					}
				})
				.catch(err => {
					console.error("Error in countdown setup:", err);
				});
	};

	return (

			<div className="galleryPage">
				<div className="container-fluid" style={{maxWidth: 970 + 'px', paddingTop: 2 + "%"}}>
					<h1 style={{margin: 0}}><strong>{`FRSSAT ${year} GALLERY`}</strong></h1>
				</div>
				{revealArt ? artLoaded ? (
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
				) : (<Box style={{paddingTop: 2 + '%'}}><CircularProgress/></Box>) : (
						<div className="container-fluid" style={{maxWidth: 970 + 'px', paddingTop: 2 + '%'}}>
							<Box>
								<Paper elevation={3}>
									<h2 style={{paddingTop: 2 + '%'}}><strong>{countdownText}</strong> until art is revealed!</h2>
									<img style={{maxWidth: 300 + 'px', padding: 2 + '%'}}
									     src="https://media.tenor.com/Z1jMniesorUAAAAC/excited-excited-dog.gif"
									     alt="tippy tappy shibby"/>
								</Paper>
							</Box>
						</div>
				)}
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