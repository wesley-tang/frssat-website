import {Component} from "react";
import {connect} from "react-redux";

import NavButton from "../components/navbutton";
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

import AutocompleteInput from "../components/autocompleteinput";

import CONFIG from "../config/CONFIG.json"

import Modal from "react-bootstrap/Modal";

class PreferencesBase extends Component {
	constructor(props) {
		super(props);
		this.state = {
			usableTags: CONFIG.tags,
			tagsInTier: {
				prefer: [],
				willing: [],
				banned: []
			},
			openDragHelp: false,
			openHumanHelp: false,
			openAnthroHelp: false,
			openFeralHelp: false
		};
	}

	updateTags(e, newValues, reason, prefTier) {
		let newTags = this.state.usableTags.slice();

		if (reason === "selectOption") {
			const addedTag = newValues.filter(x => this.state.usableTags.includes(x));

			const index = this.state.usableTags.indexOf(addedTag[0]);
			if (index > -1) {
				newTags.splice(index, 1);
			}

		} else if (reason === "removeOption") {
			console.log(this.state)
			const removedTag = this.state.tagsInTier[prefTier].filter(x => !newValues.includes(x));

			newTags = this.state.usableTags.concat(removedTag[0]);
		}

		let newPrefs = {...this.state.tagsInTier};
		newPrefs[prefTier] = newValues;

		this.setState({usableTags: newTags, tagsInTier: newPrefs});
	}

	handleModalClick(modalToOpen) {
		let newState = {};
		newState[modalToOpen] = true;
		this.setState(newState);
	}

	handleClose(modalToClose) {
		let newState = {};
		newState[modalToClose] = false;
		this.setState(newState);
	}

	render() {
		return (
				<div className="preferencesPage">
					<Modal show={this.state.openDragHelp} onHide={() => {
						this.handleClose("openDragHelp")
					}}>
						<Modal.Header>
							<Modal.Title>What is a FR Dragon?</Modal.Title>
							<IconButton onClick={() => {
								this.handleClose("openDragHelp")
							}}>
								<CloseIcon fontSize="small"/>
							</IconButton>
						</Modal.Header>

						<Modal.Body>
							<p>A Flight Rising Dragon is any of the <a href="https://www1.flightrising.com/wiki/wiki">existing
								breeds on Flight Rising</a>,
								including baby dragons and ancient breeds, but excluding any dragons not from Flight Rising.<br/><br/>Example:
							</p>
							<img
									style={{padding: '3%'}}
									src="https://lh3.googleusercontent.com/-gOo5EgKdldQ/W2E3WBMORvI/AAAAAAAALSs/fcrvQ1bfk4ETSB0ieqZQbdqHQ8zWv0P7gCL0BGAYYCw/h512/2018-07-31.jpg"
									alt="fr dragon example"
							/>
							<small>Credit: Eversnow</small>
						</Modal.Body>
					</Modal>

					<Modal show={this.state.openHumanHelp} onHide={() => {
						this.handleClose("openHumanHelp")
					}}>
						<Modal.Header>
							<Modal.Title>What is Humanoid?</Modal.Title>
							<IconButton onClick={() => {
								this.handleClose("openHumanHelp")
							}}>
								<CloseIcon fontSize="small"/>
							</IconButton>
						</Modal.Header>

						<Modal.Body>
							<p>Anything with human proportions that consists primarily of human features. May contain
								minimal non-human/animalistic features like horns.
								<br/>
								<br/>
								Example:
							</p>
							<img style={{padding: '3%'}} src="http://i.imgur.com/fYuMq7X.png" alt="humanoid example"/>
							<br/>
							<small>Credit: Fighting Polygon</small>
						</Modal.Body>
					</Modal>

					<Modal show={this.state.openAnthroHelp} onHide={() => {
						this.handleClose("openAnthroHelp")
					}}>
						<Modal.Header>
							<Modal.Title>What is Anthropomorphic?</Modal.Title>
							<IconButton onClick={() => {
								this.handleClose("openAnthroHelp")
							}}>
								<CloseIcon fontSize="small"/>
							</IconButton>
						</Modal.Header>

						<Modal.Body>
							<p>Anything with human proportions but consisting primarily of non-human/animalian features,
								usually at least the head.<br/><br/>Example:
							</p>
							<img
									style={{padding: '3%'}}
									alt="anthro example"
									src="https://vignette.wikia.nocookie.net/zootopia/images/3/3e/Nick_Sly_Fox_Render.png/revision/latest?cb=20160419235513"
							/>
						</Modal.Body>
					</Modal>

					<Modal show={this.state.openFeralHelp} onHide={() => {
						this.handleClose("openFeralHelp")
					}}>
						<Modal.Header>
							<Modal.Title>What is a FR Dragon?</Modal.Title>
							<IconButton onClick={() => {
								this.handleClose("openFeralHelp")
							}}>
								<CloseIcon fontSize="small"/>
							</IconButton>
						</Modal.Header>

						<Modal.Body>
							<p>Anything that does not conform to human proportions (four legged, etc) and lacks human
								features.
								This includes non-FR dragons, as well as both real and imagined creatures.<br/><br/>Example:
							</p>

							<img
									style={{padding: '3%'}}
									alt="feral example"
									src="https://cdn.discordapp.com/attachments/416523883651530752/516647770862387237/unknown.png"
							/>
							<br/>
							<small>Credit: Lizzi</small>
						</Modal.Body>
					</Modal>


					<div className="container-fluid" style={{maxWidth: 970 + 'px'}}>
						<h1>Please rank your <strong>drawing preferences</strong>.</h1>
					</div>
					<div className="container-fluid" style={{maxWidth: 970 + 'px'}}>
						<p align="left">
							Please fill in your drawing preferences from the options below.
							&nbsp;<strong>Any unassigned tags will be automatically filled into "Will not Draw"</strong>.
						</p>
						<p>Click on the tags for definitions and examples.</p>
						<div style={{marginTop: 0, marginBottom: 30, paddingTop: 0}} className="row justify-content-center">
							<Stack spacing={1} direction={{xs: 'column', sm: 'row'}}>
								<Chip color="primary" onClick={() => {
									this.handleModalClick("openDragHelp")
								}} icon={<HelpOutlineOutlinedIcon/>} label={"FR Dragon"}/>
								<Chip color="primary" onClick={() => {
									this.handleModalClick("openHumanHelp")
								}} icon={<HelpOutlineOutlinedIcon/>} label={"Humanoid"}/>
								<Chip color="primary" onClick={() => {
									this.handleModalClick("openAnthroHelp")
								}} icon={<HelpOutlineOutlinedIcon/>} label={"Anthropomorphic"}/>
								<Chip color="primary" onClick={() => {
									this.handleModalClick("openFeralHelp")
								}} icon={<HelpOutlineOutlinedIcon/>} label={"Feral"}/>
							</Stack>
						</div>
					</div>
					<div className="container-fluid" style={{maxWidth: 970 + 'px'}}>
						<form className="container-fluid">
							<div className="row justify-content-center">
								<AutocompleteInput
										title="Prefer Drawing"
										tags={this.state.usableTags}
										autocomplPropPassThru={{
											sx: {backgroundColor: '#CCFFCC'},
											defaultValue: this.state.tagsInTier.prefer
										}}
										chipPropPassThru={{color: 'primary'}}
										updateTags={(e, values, r) => {
											this.updateTags(e, values, r, "prefer")
										}}/>
							</div>
							<div className="row justify-content-center"
							     style={{marginTop: 2.5 + '%', marginBottom: 2.5 + '%'}}>
								<AutocompleteInput
										title="Willing to Draw"
										tags={this.state.usableTags}
										autocomplPropPassThru={{defaultValue: this.state.tagsInTier.willing}}
										updateTags={(e, values, r) => {
											this.updateTags(e, values, r, "willing")
										}}/>
							</div>
							<div className="row justify-content-center">
								<AutocompleteInput
										title="Will not Draw"
										tags={this.state.usableTags}
										autocomplPropPassThru={{
											sx: {backgroundColor: '#FFCCCC'},
											defaultValue: this.state.tagsInTier.banned
										}}
										chipPropPassThru={{color: 'error'}}
										updateTags={(e, values, r) => {
											this.updateTags(e, values, r, "banned")
										}}/>
							</div>

							<br/>
							<div
									className="d-flex justify-content-between container navBtns"

							>
								<div className="col">
									{/* <button
                  type="button"
                  className="btn btn-outline-danger"
                  id="returnToUserAndId"
                >
                  Back
                </button> */}
								</div>
								<div className="col my-auto">
									1/5
								</div>
								<div className="col d-flex justify-content-end">
									<NavButton navTo="subjects" type={"UPDATE_PREFERENCES"} payload={{
										prefsByTier: this.state.tagsInTier,
										remainingTags: this.state.usableTags
									}}/>
								</div>
							</div>
						</form>
					</div>
				</div>
		);
	}
}

const mapStateToProps = state => ({
	tagsInTier: state.prefsByTier
});

export const Preferences = connect(
		mapStateToProps
)(PreferencesBase);

