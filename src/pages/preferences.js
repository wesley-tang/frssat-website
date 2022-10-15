import {Component} from "react";
import {connect} from "react-redux";

import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';

import NavButton from "../components/navbutton";
import AutocompleteInput from "../components/autocompleteinput";
import InfoModal from "../components/infomodal";

import CONFIG from "../config/CONFIG.json"


class PreferencesBase extends Component {
	constructor(props) {
		super(props);
		this.state = {
			usableTags: CONFIG.tags,
			tagsInTier: {
				prefer: [],
				willing: [],
				banned: []
			}
		};

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

