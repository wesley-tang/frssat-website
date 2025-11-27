import React, { useEffect, useState, useCallback, useContext, useRef } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { DateTime } from "luxon";

import CardActionArea from "@mui/material/CardActionArea";
import { ImageListItem, Paper, Card, CardContent, Collapse, Button } from "@mui/material";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Stack from "@mui/material/Stack";
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

import useWindowDimensions from "../../components/useWindowDimensions";
import { EventContext } from '../../context/EventContext';
import ImageCarousel from "../../components/ImageCarousel";

export default function Gallery() {
	const { width } = useWindowDimensions();
	const { eventId } = useParams();
	const navigate = useNavigate();
	const { activeEvent } = useContext(EventContext);

	// Gallery State
	const [open, setOpen] = useState(false);
	const [revealArt, setRevealArt] = useState(false);
	const [artLoaded, setArtLoaded] = useState(false);
	const [artCards, setArtCards] = useState([]);
	const [submissions, setSubmissions] = useState([]);
	const [countdownText, setCountDownText] = useState("--d --h --m --s");
	const [currentArt, setCurrentArt] = useState({});
	const [eventsList, setEventsList] = useState([]);
	const [loadingEvents, setLoadingEvents] = useState(false);
	const [showInfo, setShowInfo] = useState(true);

	// Pagination State
	const [visibleCount, setVisibleCount] = useState(20);

	// Filters
	const [usernameFilter, setUsernameFilter] = useState("");
	const [recipientFilter, setRecipientFilter] = useState("");
	const [tagFilter, setTagFilter] = useState([]);

	// Data
	const [participants, setParticipants] = useState([]);
	const [availableTags, setAvailableTags] = useState([]);
	const [currentEventData, setCurrentEventData] = useState(null);

	// Alt Art Selection
	const [selectedAltIndex, setSelectedAltIndex] = useState(-1); // -1 for main image

	const handleClose = () => setOpen(false);

	const openArtModal = useCallback((submission) => {
		setCurrentArt(submission);
		setSelectedAltIndex(-1);
		setShowInfo(true);
		setOpen(true);
	}, []);

	const handleLoadMore = () => {
		setVisibleCount(prev => prev + 20);
	};

	// Countdown Logic
	const countDownCalc = useCallback((distance) => {
		const days = Math.floor(distance / (1000 * 60 * 60 * 24));
		const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
		const seconds = Math.floor((distance % (1000 * 60)) / 1000);

		setCountDownText(days + "d " + hours + "h " + minutes + "m " + seconds + "s");
	}, []);

	// Fetch Events List (Main Gallery Page)
	useEffect(() => {
		// Always fetch events list to get titles for past events if we are on a specific event page
		if (eventsList.length === 0) {
			setLoadingEvents(true);
			axios.get('/api/events').then(res => {
				setEventsList(res.data.events);
				setLoadingEvents(false);
			}).catch(err => {
				console.error("Failed to fetch events", err);
				setLoadingEvents(false);
			});
		}
	}, [eventsList.length]);

	// Fetch Submissions (Event Gallery Page)
	const fetchGalleryData = useCallback((id) => {
		axios.get(`/api/submissions?eventId=${id}`).then(resSub => {
			const fetchedSubmissions = resSub.data.submissions;
			setSubmissions(fetchedSubmissions);

			// Extract unique participants (artists and recipients) from submissions
			const artists = new Set();
			const recipients = new Set();
			const allTags = new Set();

			fetchedSubmissions.forEach(sub => {
				if (sub.username) artists.add(sub.username);
				if (sub.recipient) recipients.add(sub.recipient);
				if (sub.tags) {
					sub.tags.forEach(t => {
						// Handle both string tags and object tags (populated)
						allTags.add(typeof t === 'string' ? t : t.name);
					});
				}
			});

			// Add tags from the event object if available
			const event = eventsList.find(e => e._id === id);
			if (event && event.tags) {
				event.tags.forEach(t => allTags.add(typeof t === 'string' ? t : t.name));
			} else if (activeEvent && activeEvent._id === id) {
				activeEvent.tags.forEach(t => allTags.add(t.name));
			}

			// Actually, the UI uses 'participants' for both. Let's combine them?
			// The original code fetched 'participants' which was a list of all signups.
			// But for the gallery, we really only care about people involved in the displayed art.
			// Let's use the union of artists and recipients.
			const allParticipants = new Set([...artists, ...recipients]);
			setParticipants(Array.from(allParticipants).sort());

			setAvailableTags(Array.from(allTags).sort());
			setArtLoaded(true);
		});
	}, [activeEvent, eventsList]);

	const prepareCountdownGallery = useCallback((eventData) => {
		const endDate = new Date(eventData.endDate).getTime();

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
					setRevealArt(true);
					fetchGalleryData(eventData._id);
				} else {
					const countdown = setInterval(() => {
						const currentLA = DateTime.now().setZone("America/Los_Angeles");
						const distance = endDate - currentLA.toMillis();

						countDownCalc(distance);

						if (distance < 0) {
							clearInterval(countdown);
							setRevealArt(true);
							fetchGalleryData(eventData._id);
						}
					}, 1000);
				}
			})
			.catch(err => {
				console.error("Error in countdown setup:", err);
				// Fallback to reveal if error? Or show error?
				// setRevealArt(true); 
			});
	}, [countDownCalc, fetchGalleryData]);

	// Initialize Event View
	useEffect(() => {
		if (eventId) {
			// Reset state when eventId changes
			setRevealArt(false);
			setArtLoaded(false);
			setSubmissions([]);
			setArtCards([]);
			setParticipants([]);
			setAvailableTags([]);
			setCurrentEventData(null);
			setVisibleCount(20);
			setUsernameFilter("");
			setRecipientFilter("");
			setTagFilter([]);

			// Try to find event data in eventsList first
			const eventFromList = eventsList.find(e => e._id === eventId);

			if (eventFromList) {
				setCurrentEventData(eventFromList);
				// If it's the active event, check countdown
				if (activeEvent && activeEvent._id === eventId) {
					prepareCountdownGallery(activeEvent);
				} else {
					// Past event, just show it
					setRevealArt(true);
					fetchGalleryData(eventId);
				}
			} else if (activeEvent && activeEvent._id === eventId) {
				// Fallback if eventsList hasn't loaded but we have activeEvent context
				setCurrentEventData(activeEvent);
				prepareCountdownGallery(activeEvent);
			} else {
				// If we don't have event data yet (eventsList loading), wait for it.
				// But we can start fetching gallery data if we assume it's revealed.
				// However, to get the title, we need the event object.
				// We can fetch the gallery data optimistically.
				setRevealArt(true);
				fetchGalleryData(eventId);
			}
		}
	}, [eventId, activeEvent, eventsList, prepareCountdownGallery, fetchGalleryData]);


	// Filtering
	const applyFilters = useCallback(() => {
		let filteredSubmissions = [...submissions];

		if (usernameFilter) {
			filteredSubmissions = filteredSubmissions.filter(submission => submission.username === usernameFilter);
		}
		if (recipientFilter) {
			filteredSubmissions = filteredSubmissions.filter(submission => submission.recipient === recipientFilter);
		}
		if (tagFilter.length > 0) {
			filteredSubmissions = filteredSubmissions.filter(submission =>
				Array.isArray(submission.tags) && tagFilter.every(filterTag =>
					submission.tags.some(subTag =>
						(typeof subTag === 'string' ? subTag : subTag.name) === filterTag
					)
				)
			);
		}

		return filteredSubmissions;
	}, [submissions, usernameFilter, recipientFilter, tagFilter]);

	// Rendering Cards
	useEffect(() => {
		const filtered = applyFilters();
		// Slice for pagination
		const visibleSubmissions = filtered.slice(0, visibleCount);

		setArtCards(visibleSubmissions.map(submission => (
			<CardActionArea key={submission.uuid || submission.imageUrl} onClick={() => openArtModal(submission)}>
				<ImageListItem style={{ minHeight: '150px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
					<img
						src={`${submission.imageUrl}?w=248&fit=crop&auto=format`}
						loading="lazy"
						alt={`${submission.username || 'Anonymous'}'s art to ${submission.recipient}`}
						style={{ borderRadius: '8px', display: 'block', width: '100%' }}
					/>
				</ImageListItem>
			</CardActionArea>
		)));
	}, [applyFilters, openArtModal, visibleCount]);

	// Masonry Layout Logic
	const getColumnCount = () => {
		if (width > 1300) return 6;
		if (width > 1000) return 5;
		if (width > 650) return 4;
		return 3;
	};

	const columnCount = getColumnCount();
	const columns = Array.from({ length: columnCount }, () => []);

	// Distribute cards into columns
	artCards.forEach((card, index) => {
		columns[index % columnCount].push(card);
	});

	// Infinite Scroll
	const observer = useRef();
	const lastElementRef = useCallback(node => {
		if (loadingEvents) return;
		if (observer.current) observer.current.disconnect();
		observer.current = new IntersectionObserver(entries => {
			if (entries[0].isIntersecting && submissions.length > visibleCount) {
				handleLoadMore();
			}
		});
		if (node) observer.current.observe(node);
	}, [loadingEvents, submissions.length, visibleCount]);

	// Main Gallery View (List of Events)
	if (!eventId) {
		return (
			<div className="galleryPage">
				<div className="container-fluid" style={{ maxWidth: 970 + 'px', paddingTop: 2 + "%" }}>
					<h1><strong>FR SECRET SANTA GALLERIES</strong></h1>
					{loadingEvents ? <CircularProgress /> : (
						<Stack spacing={2} style={{ marginTop: '20px' }}>
							{eventsList.map(event => (
								<Card key={event._id} onClick={() => navigate(`/gallery/${event._id}`)}>
									<CardActionArea>
										<CardContent>
											<Typography variant="h5" component="div">
												{event.title} {event.year ? `(${event.year})` : ''}
											</Typography>
											<Typography variant="body2" color="text.secondary">
												{activeEvent && activeEvent._id === event._id ? 'Current Event' : 'View Gallery'}
											</Typography>
										</CardContent>
									</CardActionArea>
								</Card>
							))}
						</Stack>
					)}
				</div>
			</div>
		);
	}

	// Event Gallery View
	return (
		<div className="galleryPage">
			<div className="container-fluid" style={{ paddingTop: '2%' }}>
				<Box
					sx={{
						display: 'grid',
						gridTemplateColumns: '1fr auto 1fr',
						alignItems: 'center',
						width: '100%',
						gap: 2 // Adds space (16px) between the columns
					}}
				>
					{/* Left Column: Back Button */}
					<Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
						<Button
							variant="text"
							size="large"
							startIcon={<ArrowBackIosIcon />}
							onClick={() => navigate('/gallery')}
							sx={{
								fontSize: '1.2rem',
								color: 'text.primary',
							}}
						>
							Galleries
						</Button>
					</Box>

					{/* Center Column: Title */}
					<h1 style={{ margin: 0, textAlign: 'center' }}>
						<strong>{currentEventData ? `${currentEventData.title} GALLERY` : `GALLERY`}</strong>
					</h1>

					{/* Right Column: Spacer (keeps title centered) */}
					<Box />
				</Box>
			</div>
			{revealArt ? artLoaded ? (
				<div className="container-fluid">
					<div className="container-fluid" style={{ paddingTop: 2 + '%' }}>
						<p style={{ maxWidth: 750 + 'px' }}>
							Click/Tap on an image to view it in full with additional information! To find your own gifts, select
							your name in the "Filter by Recipient" box.
						</p>
					</div>
					<div className="container-fluid" style={{ paddingTop: 2 + '%', paddingBottom: 2 + '%' }}>
						<Stack spacing={5} direction={{ xs: 'column', sm: 'row' }}>
							<Autocomplete
								onChange={(e, newValue) => setUsernameFilter(newValue)}
								clearOnEscape
								fullWidth
								disablePortal
								id="username-box"
								options={artLoaded ? participants : []}
								renderInput={(params) => <TextField {...params} label="Filter by Artist" />}
							/>
							<Autocomplete
								onChange={(e, newValue) => setRecipientFilter(newValue)}
								clearOnEscape
								fullWidth
								disablePortal
								id="recipient-box"
								options={artLoaded ? participants : []}
								renderInput={(params) => <TextField {...params} label="Filter by Recipient" />}
							/>
							<Autocomplete
								multiple
								onChange={(e, newValue) => setTagFilter(newValue)}
								clearOnEscape
								fullWidth
								disablePortal
								id="category-box"
								options={availableTags}
								renderInput={(params) => <TextField {...params} label="Filter by Tags" />}
							/>
						</Stack>
					</div>
					<div className="container-fluid">
						{/* Masonry Layout */}
						<Stack direction="row" spacing={2} alignItems="flex-start" justifyContent="center">
							{columns.map((col, i) => (
								<Stack key={i} spacing={2} sx={{ width: `${100 / columnCount}%` }}>
									{col}
								</Stack>
							))}
						</Stack>

						{/* Sentinel for Infinite Scroll */}
						<div ref={lastElementRef} style={{ height: '20px', margin: '20px 0', textAlign: 'center' }}>
							{submissions.length > visibleCount && <CircularProgress />}
						</div>
					</div>
				</div>
			) : (<Box style={{ paddingTop: 2 + '%' }}><CircularProgress /></Box>) : (
				<div className="container-fluid" style={{ maxWidth: 970 + 'px', paddingTop: 2 + '%' }}>
					<Box>
						<Paper elevation={3}>
							<h2 style={{ paddingTop: 2 + '%' }}><strong>{countdownText}</strong> until art is revealed!</h2>
							<img style={{ maxWidth: 300 + 'px', padding: 2 + '%' }}
								src="https://media.tenor.com/Z1jMniesorUAAAAC/excited-excited-dog.gif"
								alt="tippy tappy shibby" />
						</Paper>
					</Box>
				</div>
			)}

			{/* Dialog */}
			<Dialog
				open={open}
				onClose={handleClose}
				maxWidth="xl"
				fullWidth
				scroll="paper"
				aria-labelledby="art-dialog-title"
				PaperProps={{
					sx: {
						backgroundColor: 'transparent',
						boxShadow: 'none',
						overflow: 'hidden',
						height: '90vh',
						maxHeight: '90vh'
					}
				}}
			>
				<DialogContent sx={{ p: 0, overflow: 'hidden', height: '100%', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.8)' }}>
					<IconButton
						aria-label="close"
						onClick={handleClose}
						sx={{
							position: 'absolute',
							right: 8,
							top: 8,
							color: 'white',
							zIndex: 100,
							backgroundColor: 'rgba(0,0,0,0.3)',
							'&:hover': { backgroundColor: 'rgba(0,0,0,0.5)' }
						}}
					>
						<CloseIcon />
					</IconButton>

					{/* Main Image Container */}
					<Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
						<ImageCarousel
							images={currentArt.imageUrl ? [currentArt.imageUrl, ...(currentArt.altLinks || [])] : []}
							selectedIndex={selectedAltIndex + 1}
							onIndexChange={(newIndex) => setSelectedAltIndex(newIndex - 1)}
						/>
					</Box>

					{/* Info Card Overlay */}
					<Collapse in={showInfo} timeout="auto" unmountOnExit sx={{
						position: 'absolute',
						bottom: 20,
						right: 20,
						width: { xs: '90%', sm: '400px' },
						zIndex: 20
					}}>
						<Paper elevation={3} sx={{
							maxHeight: '40vh',
							overflowY: 'auto',
							p: 3,
							borderRadius: 2,
							backgroundColor: 'rgba(255, 255, 255, 0.9)',
							backdropFilter: 'blur(5px)'
						}}>
							<Typography variant="h5" gutterBottom>
								From: {currentArt.anonymous || !currentArt.username ? <i>Anonymous</i> : (
									<a href={`https://www1.flightrising.com/clan-profile/n/${currentArt.username}`} target="_blank" rel="noreferrer">
										{currentArt.username}
									</a>
								)}
							</Typography>
							<Typography variant="h5" gutterBottom>
								To: <a href={`https://www1.flightrising.com/clan-profile/n/${currentArt.recipient}`} target="_blank" rel="noreferrer">
									{currentArt.recipient}
								</a>
							</Typography>

							{currentArt.message && (
								<Box mt={2}>
									<Typography variant="h6">Message:</Typography>
									<Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>{currentArt.message}</Typography>
								</Box>
							)}

							<Box mt={2} display="flex" alignItems="center" justifyContent="space-between">
								<Typography variant="caption">
									<a href={selectedAltIndex === -1 ? currentArt.imageUrl : currentArt.altLinks[selectedAltIndex]} target="_blank" rel="noreferrer">
										Source
									</a>
								</Typography>
							</Box>
						</Paper>
					</Collapse>

					{/* Visibility Toggle */}
					<IconButton
						onClick={() => setShowInfo(!showInfo)}
						sx={{
							position: 'absolute',
							bottom: 20,
							right: 20,
							transition: 'all 0.3s ease',
							backgroundColor: 'rgba(255, 255, 255, 0.8)',
							'&:hover': { backgroundColor: 'rgba(255, 255, 255, 1)' },
							zIndex: 21
						}}
					>
						{showInfo ? <VisibilityOffIcon /> : <VisibilityIcon />}
					</IconButton>

				</DialogContent>
			</Dialog>
		</div>
	);
}