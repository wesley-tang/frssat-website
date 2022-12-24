import {useEffect, useState} from "react";

import axios from 'axios';

import CONFIG from "../../config/CONFIG.json";

import CardActionArea from "@mui/material/CardActionArea";
import CardMedia from "@mui/material/CardMedia";
import Card from "@mui/material/Card";
// import TextField from "@mui/material/TextField";

import {Grid, Paper} from "@mui/material";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import * as React from "react";

export default function Gallery() {
	const [open, setOpen] = useState(false);
	const [revealArt, setRevealArt] = useState(false);
	const [artLoaded, setArtLoaded] = useState(false);
	const [artCards, setArtCards] = useState([]);
	const [countdownText, setCountDownText] = useState("");


	const handleClose = () => {
		console.log(open);
		setOpen(false);
	};

	function openArtModal(submission) {
		// set values for the card here
		handleClose();
		setOpen(true);
	}

	function countDownCalc(distance) {
		const days = Math.floor(distance / (1000 * 60 * 60 * 24));
		const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
		const seconds = Math.floor((distance % (1000 * 60)) / 1000);

		setCountDownText(days + "d " + hours + "h " + minutes + "m " + seconds + "s");
	}

	function revealArtGallery() {
		setRevealArt(true);
		const artCardsTemp = [];

		axios.get('/api/submissions').then(resSub => {
			resSub.data.submissions.forEach(submission => artCardsTemp.push(
					<di>
						<Card sx={{width: 345, height: 365}}>
							<CardActionArea onClick={() => openArtModal(submission)}>
								<CardMedia
										component="img"
										image={submission.imageUrl}
										sx={{maxHeight: 90 + "%"}}
								/>
								<CardContent>
									<Typography variant="body2" color="text.secondary">
										Recipient: {submission.recipient}
									</Typography>
								</CardContent>
							</CardActionArea>
						</Card>
					</di>
			))

			setArtCards(artCardsTemp);
			setArtLoaded(true);
		});
	}

	useEffect(() => {
		let currentDate;
		const endDate = Date.parse(CONFIG.endDate);

		axios.get("http://worldtimeapi.org/api/timezone/America/Los_Angeles").then(res => {
			console.log("GETTING DATE");
			console.log(res.data);
			if (res.data == null) {
				currentDate = new Date();
			} else {
				currentDate = new Date(res.data.unixtime * 1000)
			}

			if (currentDate >= endDate) {
				revealArtGallery();
			} else {
				const countdown = setInterval(() => {
					const distance = endDate - currentDate;

					countDownCalc(distance)

					if (distance < 0) {
						clearInterval(countdown);
						revealArtGallery();
					}

					currentDate.setSeconds(currentDate.getSeconds() + 1);
				}, 1000);
			}
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (

			<div className="galleryPage">
				<div className="container-fluid" style={{maxWidth: 970 + 'px', paddingTop: 2 + "%"}}>
					<h1 style={{margin: 0}}><strong>FRSSAT 2022 GALLERY</strong></h1>
				</div>
				{revealArt ? artLoaded ? (
						<div className="container-fluid" style={{paddingTop: 2 + '%'}}>
							<div className="container-fluid" style={{paddingTop: 2 + '%'}}>
								filters go here
							</div>
							<div className="container-fluid">
								<Grid
										container
										direction="row"
										justify="flex-start"
										alignItems="flex-start"
										sx={{"justify-content": "space-around"}}
								>
									{artCards}
								</Grid>
							</div>
						</div>
				) : (<Box><CircularProgress/></Box>) : (
						<div className="container-fluid" style={{maxWidth: 970 + 'px', paddingTop: 2 + '%'}}>
							<Box>
								<Paper elevation={3}>
									<h2 style={{paddingTop: 2 + '%'}}><strong>{countdownText}</strong> until art is revealed!</h2>
									<img style={{maxWidth: 300 + 'px', padding: 2 + '%'}} src="https://media.tenor.com/Z1jMniesorUAAAAC/excited-excited-dog.gif"
									     alt="tippy tappy shibby"/>
								</Paper>
							</Box>
						</div>
				)}
			</div>
	)
			;
}