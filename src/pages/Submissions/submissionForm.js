import * as React from 'react';
import {Component} from "react";
import {connect} from "react-redux";

import {GoogleSpreadsheet} from "google-spreadsheet";
import { v4 as uuidv4 } from 'uuid';

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

import SendIcon from '@mui/icons-material/Send';

import CONFIG from "../../config/CONFIG.json";
import NavButton from "../../components/navbutton";


const RECIPIENT_FORMULA = "=VLOOKUP(\"user\", matchups!A2:B90, 2, false)";
const ACCEPTED_FILE_TYPES = ["apng", "avif", "gif", "jpeg", "jpg", "png", "svg", "webp"];

class SubmissionBase extends Component {

	doc = new GoogleSpreadsheet("1eE2j4gCJzS2chf7aFY7ywlDC6htbcOs61qKNpsEPV1U");

	participants = [];
	tags = [];

	constructor(props) {
		super(props);
		CONFIG.tags.forEach((tag) => this.tags.push(tag["name"]))
		this.doc.useServiceAccountAuth({
			"private_key": process.env.PRIVATE_KEY,
			"client_email": process.env.CLIENT_EMAIL
		}).then(() => {
			this.doc.loadInfo().then(() => {
				this.getPromisedArrayFromSheetAndColumn("participants", "participants").then(res => {
					this.participants = res;
					this.setConnected();
				})
			})
		}).catch(err => {
			console.log(err)
		})

		this.state = {
			connected: false,
			recipientEditable: false,
			recipientLoading: false,
			isPrimaryRecipient: false,
			validImageFileType: true,
			messageTooLong: false,
			loadingSubmit: false,
			alertOpen: false,
			alertMessage: "",
			submitted: false,
			uuid: "",
			username: "",
			recipient: "",
			imageUrl: "",
			secondaryLinks: "",
			category: "",
			message: "",
			note: "",
			anonymous: false,
			nextYear: false
		};
	}

	getPromisedArrayFromSheetAndColumn(sheet, column) {
		return this.doc.sheetsByTitle[sheet].getRows().then(res => {
			return Array.from(res.values()).map(v => v[column]);
		})
	}


	setConnected() {
		this.setState({connected: true});
	}

	setSubmitted() {
		this.setState({submitted: true});
	}

	handleAnonChange() {
		this.setState({anonymous: !this.state.anonymous});
	}

	handleNextYearChange() {
		this.setState({nextYear: !this.state.nextYear});
	}

	setUserName(e, newValue) {
		this.setState({username: newValue, recipientLoading: true});

		this.getPromisedArrayFromSheetAndColumn("submissions", "username").then(res => {
			if (res.includes(newValue)) {
				this.setState({recipientEditable: true, recipientLoading: false, isPrimaryRecipient: false})
			} else {
				this.setState({
					recipient: RECIPIENT_FORMULA.replace("user", newValue),
					recipientLoading: false,
					isPrimaryRecipient: true
				})
			}
		})
	}

	setRecipient(e, newValue) {
		this.setState({recipient: newValue});
	}

	setCategory(e, newValue) {
		this.setState({category: newValue});
	}

	setImage(e) {
		if (ACCEPTED_FILE_TYPES.some(s => e.target.value.endsWith(s))) {
			this.setState({validImageFileType: true, imageUrl: e.target.value});
		} else {
			this.setState({validImageFileType: false});
		}
	}

	setSecondaryImages(e) {
	//todo make this better
		this.setState({secondaryLinks: e.target.value});
	}

	setMessage(e) {
		const text = e.target.value
		if (text.length > 300) {
			this.setState({messageTooLong: true});
		}
		this.setState({message: text, messageTooLong: false});
	}

	setNote(e) {
		this.setState({note: e.target.value});
	}

	submitArt(e) {
		let errors = ""
		if (this.state.username === "") {
			errors +=  "Username required. ";
		}
		if (this.state.recipient === "") {
			errors +=  "Recipient required. ";
		}
		if (this.state.imageUrl === "") {
			errors +=  "Image URL required. ";
		}
		if (this.state.category === "") {
			errors += "Category required. ";
		}

		if (errors !== "") {
			this.setState({alertMessage: errors, alertOpen: true});
		} else {
			const uuid = uuidv4();
			this.setState({loadingSubmit: true, uuid: uuid}, () => {
				console.log(this.state)
				this.doc.sheetsByTitle["submissions"].addRow(this.state).then(() => {
					let submissionsObj = JSON.parse(localStorage.getItem("submissions"));

					if (submissionsObj === null) {
						submissionsObj = {"submissions" :[{"uuid": uuid, "imageUrl": this.state.imageUrl}]};
					} else {
						submissionsObj["submissions"].push({"uuid": uuid, "imageUrl": this.state.imageUrl});
					}
					localStorage.setItem("submissions", JSON.stringify(submissionsObj));
					this.setState({alertMessage: "Submission complete! To edit this submission, use the code: " + uuid, submitted: true});
				}).catch((err) => {
					console.warn(err);
					this.setState({alertMessage: "Submission failed! :(\nError:\n" + err});
				}).finally(() => {
					this.setState({loadingSubmit: false, alertOpen: true});
				})
			});
		}
	}

	handleClose(e) {
		this.setState({alertOpen: false});
	}

	render() {
		return (
				<div className="submissionPage">
					<div className="container-fluid" style={{maxWidth: 970 + 'px'}}>
						<h1><strong>FR SECRET SANTA ART SUBMISSION</strong></h1>
					</div>
					<div className="container-fluid" style={{maxWidth: 970 + 'px'}}>
						<p align="left">
							Congratulations on finishing your beautiful artwork! Please upload your art to a private site such as
							&nbsp;<a href={"https://imgur.com/upload"}>https://imgur.com/upload</a>&nbsp;
							or if you have Discord, upload it to a private channel or DM and copy the link to the image in order to
							keep the element of surprise!
							<br/><br/>
							(If you are a traditional artist who wants one of us to touch up your artwork, please do not submit this
							form yet! Instead, <a href={"https://www1.flightrising.com/msgs/new?to=Hexlash"}>private message Hex</a> a
							link to your artwork and I'll send you back a link to the edited
							version so you can submit this form.)
							<br/><br/>
							You are free to submit multiple times after you have completed your primary piece.
							<br/><br/>
							If you have any questions or issues with the form, please PM us or ping us on the <a
								href={"https://www1.flightrising.com/forums/cc/3183232/1"}>thread</a>!
							<br/><br/>
							Thank you for taking part in this event, and we hope to see you again next year!
						</p>
					</div>
					{
						this.state.connected ? (
										<div className="container-fluid" style={{maxWidth: 970 + 'px', paddingTop: 2 + '%'}}>
											<div id="username-field">
												<p align="left" style={{paddingBottom: 1 + '%'}}><strong>Username</strong></p>
												<form className="container-fluid">
													<Autocomplete
															onChange={(e, newValue) => this.setUserName(e, newValue)}
															disablePortal
															autoHighlight
															id="username-box"
															options={this.state.connected ? this.participants : []}
															renderInput={(params) =>
																	<TextField {...params} required variant="filled" label="Your Username"/>}
													/>
												</form>
											</div>

											<div id="recipient-field" style={{paddingTop: 2 + '%'}}>
												<p align="left" style={{paddingBottom: 1 + '%'}}><strong>Recipient</strong></p>
												{this.state.recipientLoading ? (<Box><CircularProgress/></Box>) : (
														<form className="container-fluid">
															<Autocomplete
																	onChange={(e, newValue) => this.setRecipient(e, newValue)}
																	disabled={!this.state.recipientEditable}
																	disablePortal
																	autoHighlight
																	id="recipient-box"
																	options={this.state.connected ? this.participants : []}
																	renderInput={(params) =>
																			<TextField {...params}
																			           required
																			           variant="filled"
																			           helperText={this.state.isPrimaryRecipient ? "If you wish to submit for someone else, complete this current submission and then start a new one." : ""}
																			           label={this.state.isPrimaryRecipient ? "(You are submitting for your matched recipient!)" : this.state.recipientEditable ? "Your Recipient" : "(Please enter your username to begin)"}/>}
															/>
														</form>
												)}
											</div>

											<div id="image-field" style={{paddingTop: 2 + '%'}}>
												<p align="left" style={{paddingBottom: 1 + '%'}}><strong>Art</strong></p>
												<form className="container-fluid">
													<TextField
															required
															fullWidth
															error={this.state.validImageFileType ? undefined : true}
															helperText={this.state.validImageFileType ? undefined : "Requires URL ending in: apng, avif, gif, jpeg, jpg, png, svg, or webp"}
															onChange={(e) => this.setImage(e)}
															id="image-field"
															label="Link to Art"
															variant="filled"/>
												</form>
												{this.state.validImageFileType && this.state.imageUrl !== "" ? (
														<div className="row justify-content-center">
															<img src={this.state.imageUrl}
															     alt="Subject Reference (If you're seeing this alt text, it may be that your link is broken. Make sure it works or else it will not display.)"/>
														</div>
												) : undefined}
											</div>

											<div id="secondary-images-field" style={{paddingTop: 2 + '%'}}>
												<p align="left" style={{paddingBottom: 1 + '%'}}><strong>Secondary Art</strong> (Optional)</p>
												<TextField
														fullWidth
														helperText={"If you have any variations or alt versions, include them here in a comma separated list."}
														onChange={(e) => this.setSecondaryImages(e)}
														id="image-field"
														label="Comma Separated List of Secondary Art URLs"
														variant="filled"/>
											</div>

											<div id="category-field" style={{paddingTop: 2 + '%'}}>
												<p align="left" style={{paddingBottom: 1 + '%'}}><strong>Category</strong></p>
												<Autocomplete
														required
														onChange={(e, newValue) => this.setCategory(e, newValue)}
														disablePortal
														autoHighlight
														id="category-box"
														options={this.tags}
														renderInput={(params) =>
																<TextField {...params} variant="filled" label="Category"/>}
												/>
											</div>

											<div id="message-field" style={{paddingTop: 2 + '%'}}>
												<p align="left" style={{paddingBottom: 1 + '%'}}><strong>Holiday Message</strong> (Optional)</p>
												<TextField
														id="outlined-basic"
														label="Holiday Message"
														error={this.state.messageTooLong}
														helperText={"Little message to your recipient! " + this.state.message.length + "/300"}
														minRows={4}
														onChange={event => this.setMessage(event)}
														fullWidth
														multiline
														variant="filled"/>
											</div>

											<div id="note-field" style={{paddingTop: 2 + '%'}}>
												<p align="left" style={{paddingBottom: 1 + '%'}}><strong>Private Note</strong> (Optional)</p>
												<TextField
														id="outlined-basic"
														label="Private Note"
														helperText={"Anything you would like the organizers to know!"}
														minRows={4}
														onChange={event => this.setNote(event)}
														fullWidth
														multiline
														variant="filled"/>
											</div>

											<form className="row justify-content-center" style={{maxWidth: 970 + 'px'}}>
												<div className="row container justify-content-center">

													<div className="form-check form-check-inline">
														<FormGroup>
															<FormControlLabel control={<Checkbox onChange={event => this.handleAnonChange(event)}
															                                     checked={this.state.anonymous}/>}
															                  label="Remain anonymous for this submission."/>
														</FormGroup>
													</div>
													<div className="form-check form-check-inline">
														<FormGroup>
															<FormControlLabel control={<Checkbox onChange={event => this.handleNextYearChange(event)}
															                                     checked={this.state.nextYear}/>}
															                  label="Notify me when FR Secret Santa Art Trade is run again next year!"/>
														</FormGroup>
													</div>
												</div>
												<br/>
												<div
														className="d-flex justify-content-between container navBtns"
														style={{maxWidth: 970 + 'px'}}
												>
													<div className="col d-flex justify-content-start">
														<NavButton
																navTo="submissions"
																type={""}
																pageStateKey={"submissionState"}
																pageState={this.state}
																text={"Back"}
																/>
													</div>
													<div className="col d-flex justify-content-end">
														<Button
																id="submit-art-btn"
																onClick={(e) => this.submitArt(e)}
																variant="contained"
																endIcon={<SendIcon />}
														>
															{this.state.loadingSubmit ? <CircularProgress/> : "SUBMIT!"}
														</Button>
													</div>
												</div>
											</form>
										</div>
								) : (<div className="container-fluid" style={{maxWidth: 970 + 'px', paddingTop: 2 + '%'}}>
											<Box><CircularProgress/></Box>
										</div>)
					}
					<Dialog
						open={this.state.alertOpen}
						onClose={() => this.handleClose()}
						aria-labelledby="alert-dialog-title"
						aria-describedby="alert-dialog-description"
				>
					<DialogTitle id="alert-dialog-title">
						Submission Alert
					</DialogTitle>
					<DialogContent>
						<DialogContentText id="alert-dialog-description">
							{this.state.alertMessage}
						</DialogContentText>
					</DialogContent>
					<DialogActions>
						{this.state.submitted ? (<NavButton
								navTo="submissions"
								type={""}
								pageStateKey={"submissionState"}
								pageState={this.state}
								text={"Done!"}
								passThrough = {{
									color: "success",
									variant: "contained"
								}}
						/>) : (<Button onClick={(e) => this.handleClose(e)}>Okay</Button>)}

					</DialogActions>
				</Dialog>
				</div>
		);
	}
}

// const mapStateToProps = state => ({
//   // todos: state.list,
//   // inputText: state.inputText
// });

const mapDispatchToProps = dispatch => ({
	// updateUserInfo: bindActionCreators(updateUserInfo, dispatch)
});

export const Submission = connect(
		mapDispatchToProps
)(SubmissionBase);

