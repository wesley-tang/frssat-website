import {Component} from "react";
import {connect} from "react-redux";

import NavButton from "../../components/navbutton";
import SubjectModal from "../../components/subjectmodal";
import {SubjectCard} from "../../components/subjectcard";

import CONFIG from "../../config/CONFIG.json"

import Stack from '@mui/material/Stack';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import Card from '@mui/material/Card';
import {CardActionArea} from '@mui/material';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';

class SubjectsBase extends Component {
	constructor(props) {
		super(props);
		let subjectState = null;
		try {
			subjectState = JSON.parse(localStorage.getItem("subjectState"));
		} catch (e) {
			console.warn("FAILED TO LOAD FROM LOCAL STORAGE.")
		}
		if (subjectState === null) {
			this.state = {
				subjects:
						[],
				noRanking: false,
				editing: false,
				usableTags: CONFIG.tags,
				subjectName: "",
				subjectTags: [],
				subjectImageUrl: "",
				subjectInfo: "",
				subjectPosition: -1,
				subjectHasImage: false
			};
		} else {
			this.state = subjectState;
		}
	}

	localSave() {
		try {
			localStorage.setItem("subjectState", JSON.stringify(this.state));
		} catch (e) {
			console.warn("FAILED TO SAVE STATE. PROGRESS NOT SAVED.")
		}
	}

	//TODO FIX THE WIDTH NOT HAVING A MARGIN
	// todo rewrite these as basically one function but going in different directions by swapping the variables that are swapped
	handleUpvoteClick(subject) {
		const newSubjectsOrdering = Array.from(this.state.subjects);

		const tempSubject = this.state.subjects[subject.position - 1];

		subject.position -= 1;
		newSubjectsOrdering[subject.position] = subject;

		tempSubject.position += 1;
		newSubjectsOrdering[subject.position + 1] = tempSubject;

		this.setState({subjects: newSubjectsOrdering});
	}


	handleDownvoteClick(subject) {
		const newSubjectsOrdering = Array.from(this.state.subjects);

		const tempSubject = this.state.subjects[subject.position + 1];

		subject.position += 1;
		newSubjectsOrdering[subject.position] = subject;

		tempSubject.position -= 1;
		newSubjectsOrdering[subject.position - 1] = tempSubject;

		this.setState({subjects: newSubjectsOrdering});
	}

	handleChange() {
		this.setState({noRanking: !this.state.noRanking});
	}

	updateNameInput(event) {
		this.setState({subjectName: event.target.value});
	}

	updateImageUrlInput(event) {
		this.setState({
			subjectImageUrl: event.target.value,
			subjectHasImage: (event.target.value.endsWith("png") || event.target.value.endsWith("jpg") || event.target.value.endsWith("gif"))
		});
	}

	updateInfoInput(event) {
		this.setState({subjectInfo: event.target.value});
	}

	openModal() {
		this.setState({editing: true});
	}

	openForEditing(subject) {
		const baseTags = CONFIG.tags;
		console.log(subject.tags)
		let remainingTags = baseTags.filter(x => {
			for (const tag of subject.tags) {
				if (tag.id === x.id) {
					return false;
				}
			}
			return true;
		});
		console.log(remainingTags)
		this.setState({
			editing: true,
			usableTags: remainingTags,
			subjectName: subject.name,
			subjectTags: subject.tags,
			subjectImageUrl: subject.imageUrl,
			subjectInfo: subject.info,
			subjectPosition: subject.position,
			subjectHasImage: (subject.imageUrl ? subject.imageUrl.endsWith("png") || subject.imageUrl.endsWith("jpg") || subject.imageUrl.endsWith("gif") : undefined)

		});
	}

	handleClose() {
		this.resetCurrentSubject();
		this.setState({editing: false});
		this.localSave()
	}

	handleSave() {
		let newCard = {
			name: this.state.subjectName,
			imageUrl: this.state.subjectImageUrl ? this.state.subjectImageUrl : undefined,
			tags: this.state.subjectTags,
			info: this.state.subjectInfo,
			position: this.state.subjects.length
		};

		if (this.state.subjectPosition !== -1) {
			newCard = {...newCard, position: this.state.subjectPosition};
			let updatedSubjects = [...this.state.subjects];
			updatedSubjects[this.state.subjectPosition] = newCard;
			this.setState({subjects: updatedSubjects});
		} else {
			this.setState({subjects: this.state.subjects.concat(newCard)});
		}
		this.handleClose();
	}

	handleDelete() {
		if (this.state.subjectPosition !== -1) {
			const newSubjects = [...this.state.subjects];
			newSubjects.splice(this.state.subjectPosition, 1);
			for (let i = this.state.subjectPosition; i < newSubjects.length; i++) {
				newSubjects[i].position -= 1;
			}
			this.setState({subjects: newSubjects});
		}
		this.handleClose();
	}

	updateTags(e, newValues, reason) {
		let newTags = this.state.usableTags.slice();

		if (reason === "selectOption") {
			const addedTag = newValues.filter(x => this.state.usableTags.includes(x));

			const index = this.state.usableTags.indexOf(addedTag[0]);
			if (index > -1) {
				newTags.splice(index, 1);
			}
		} else if (reason === "removeOption") {
			const removedTag = this.state.subjectTags.filter(x => !newValues.includes(x));

			newTags = this.state.usableTags.concat(removedTag[0]);
		}

		this.setState({usableTags: newTags, subjectTags: newValues});
	}

	resetCurrentSubject() {
		this.setState({
			usableTags: CONFIG.tags,
			subjectName: "",
			subjectTags: [],
			subjectImageUrl: "",
			subjectInfo: "",
			subjectPosition: -1,
			subjectHasImage: false
		})
	}

	renderCards() {
		let cards = []

		this.state.subjects.forEach(subject => {
			cards.push(
					<SubjectCard
							noRanking={this.state.noRanking}
							numOfCards={this.state.subjects.length}
							subject={subject}
							handleUpvoteClick={() => {
								this.handleUpvoteClick(subject)
							}}
							handleDownvoteClick={() => {
								this.handleDownvoteClick(subject)
							}}
							openForEditing={() => {
								this.openForEditing(subject)
							}}
					/>)
		})

		if (this.state.subjects.length < CONFIG.maxSubjects) {
			cards.push(
					<Card sx={{minWidth: 150, maxWidth: 225, minHeight: 200}}>
						<CardActionArea sx={{height: 100 + '%'}} onClick={() => {
							this.openModal()
						}}>
							<CardContent>
								<AddCircleOutlineIcon sx={{fontSize: 50}}/>
								<Typography variant="body2" color="text.secondary">
									Add a Subject
								</Typography>
							</CardContent>
						</CardActionArea>
					</Card>)
		}

		return cards;
	}

	render() {
		return (
				<div className="subjectsPage">
					<SubjectModal
							editing={this.state.editing}
							usableTags={this.state.usableTags}
							name={this.state.subjectName}
							imageUrl={this.state.subjectImageUrl}
							tags={this.state.subjectTags}
							info={this.state.subjectInfo}
							hasImage={this.state.subjectHasImage}
							hideModal={() => this.handleClose()}
							updateNameInput={event => {
								this.updateNameInput(event)
							}}
							updateImageUrlInput={event => {
								this.updateImageUrlInput(event)
							}}
							updateTags={(e, values, r) => this.updateTags(e, values, r)}
							updateInfoInput={event => {
								this.updateInfoInput(event)
							}}
							handleSave={() => {
								this.handleSave()
							}}
							handleDelete={() => {
								this.handleDelete()
							}}
					/>
					<div className="container-fluid" style={{maxWidth: 970 + 'px'}}>
						<h1><strong>ADD THE SUBJECTS YOU WANT DRAWN</strong></h1>
					</div>
					<div className="container-fluid" style={{maxWidth: 970 + 'px'}}>
						<div className="row justify-content-center" style={{padding: '2%'}}>
							<p align="left">
								Please fill in the subjects that you wish to have drawn for this event. Click
								on the arrows to increase or decrease the priority of each subject, from <strong>1 being your most
								wanted to {CONFIG.maxSubjects} being your least</strong>. You can disable ranking if you don't care or have no
								preference for which subject you want drawn. You may have up to {CONFIG.maxSubjects} subjects.
							</p>
							<p align="center" style={{marginTop: '5%', marginBottom: '0%'}}>
								Tap on a card to edit it!
							</p>
						</div>
					</div>
					<div className="container-fluid">
						<div className="row justify-content-center">
							<Stack
									direction={{xs: 'column', lg: 'row'}}
									spacing={{xs: 2}}
							>
								{this.renderCards()}
							</Stack>
						</div>
					</div>
					<div className="container-fluid" style={{maxWidth: 970 + 'px'}}>
						<div className="row justify-content-center" style={{maxWidth: 970 + 'px'}}>
							<FormGroup>
								<FormControlLabel control={<Checkbox onChange={event => this.handleChange(event)}
								                                     checked={this.state.noRanking}/>}
								                  label="Disable ranking/No preferences"/>
							</FormGroup>
						</div>
						<div className="row justify-content-center" style={{maxWidth: 970 + 'px'}}>
							<br/>
							<div
									className="row navBtns container justify-content-center"
									style={{maxWidth: 970 + 'px'}}
							>
								<div className="col d-flex justify-content-start">
									<NavButton
											navTo="preferences"
											type={"UPDATE_SUBJECTS"}
											pageStateKey={"subjectState"}
											pageState={this.state}
											text={"Back"}
											payload={{subjects: this.state.subjects, noRanking: this.state.noRanking}}/>
								</div>
								<div className="col my-auto">
									2/5
								</div>
								<div className="col d-flex justify-content-end">
									<NavButton
											navTo="tier"
											type={"UPDATE_SUBJECTS"}
											pageStateKey={"subjectState"}
											pageState={this.state}
											payload={{subjects: this.state.subjects, noRanking: this.state.noRanking}}/>
								</div>
							</div>
						</div>
					</div>
				</div>
		);
	}
}


export const Subjects = connect(
)(SubjectsBase);

