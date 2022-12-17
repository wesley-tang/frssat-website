import {Component} from "react";
import {connect} from "react-redux";

import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';


import NavButton from "../../components/navbutton";
import AutocompleteInput from "../../components/autocompleteinput";
import InfoModal from "../../components/infomodal";

import CONFIG from "../../config/CONFIG.json"


class PreferencesBase extends Component {
	constructor(props) {
		super(props);
		let prefState = null;
		try {
			prefState = JSON.parse(localStorage.getItem("prefState"));
		} catch (e) {
			console.warn("FAILED TO LOAD FROM LOCAL STORAGE.")
		}
		if (prefState === null) {
			this.state = {
				usableTags: CONFIG.tags,
				tagsInTier: {
					prefer: [],
					willing: [],
					banned: []
				}
			};
		} else {
			this.state = prefState;
		}

		CONFIG.tags.forEach(tag => {
			// eslint-disable-next-line react/no-direct-mutation-state
			this.state["open" + tag.name] = false;
		})
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

	renderTagModals(tags) {
		const tagsInfoModals = [];

		tags.forEach(tag => {
					tagsInfoModals.push(
							<InfoModal
									openModelFlag={this.state["open" + tag.name]}
									tag={tag}
									handleClose={() => {
										this.handleClose("open" + tag.name)
									}}
							/>
					)
				}
		)

		return tagsInfoModals;
	}

	renderTagChips(tags) {
		const tagsChips = [];

		tags.forEach(tag => {
					tagsChips.push(
							<Chip color="primary" onClick={() => {
								this.handleModalClick("open" + tag.name)
							}} icon={<HelpOutlineOutlinedIcon/>} label={tag.name}
							/>
					)
				}
		)

		return tagsChips;
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
					{this.renderTagModals(CONFIG.tags)}


					<div className="container-fluid" style={{maxWidth: 970 + 'px'}}>
						<h1><strong>RANK YOUR DRAWING PREFERENCES</strong></h1>
					</div>
					<div className="container-fluid" style={{maxWidth: 970 + 'px'}}>
						<p align="center">
							Please fill in your drawing preferences from the options below.<br/>
							Any unassigned tags will be automatically filled into WILL NOT DRAW.
						</p>
						<br/>
						<p>Click on the tags for definitions and examples.</p>
						<div style={{marginTop: 1 + '%', marginBottom: 30, paddingTop: 0}} className="row justify-content-center">
							<Stack spacing={1} direction={{xs: 'column', sm: 'row'}}>
								{this.renderTagChips(CONFIG.tags)}
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
							     style={{marginTop: 1.2 + '%', marginBottom: 1.2 + '%'}}>
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
									<div className="col d-flex justify-content-start">
										<NavButton
												navTo=""
												type={"UPDATE_PREFERENCES"}
												pageStateKey={"prefState"}
												pageState={this.state}
												text={"Back"}
												payload={{
											prefsByTier: this.state.tagsInTier,
											remainingTags: this.state.usableTags
										}}/>
									</div>
								</div>
								<div className="col my-auto">
									1/5
								</div>
								<div className="col d-flex justify-content-end">
									<NavButton
											navTo="subjects"
											type={"UPDATE_PREFERENCES"}
											pageStateKey={"prefState"}
											pageState={this.state}
											payload={{
												prefsByTier: this.state.tagsInTier,
												remainingTags: this.state.usableTags,
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

