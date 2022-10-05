import React, {Component} from "react";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {loadFinalText, reset} from "../state/formState";

import NavButton from "../components/navbutton";
import Button from '@mui/material/Button';

class FinishBase extends Component {
	componentWillMount() {
		this.props.loadFinalText();
		this.setState({dirty: true});

	}

	componentDidMount() {
		window.onbeforeunload = function () {
			if (this.state.dirty) {
				return "Are you sure? You have not finished your form yet and leaving will lose your progress.";
			}
		};

		const source = document.querySelector('#completeForm');

		source.addEventListener('copy', (event) => {
			this.setState({dirty: false});
		});
	}

	handleClick() {
		this.select()
		document.execCommand("copy");

		alert(
				"And that's it - you've copied your completed sign-up form! Head to the forums to paste and post to finish signing up :D"
		);
		this.setState({dirty: false});
	}

	select() {
		let copyText = document.getElementById("completeForm");
		copyText.select();
		copyText.setSelectionRange(0, 99999);
	}

	render() {
		return (
				<div className="finishPage">
					<div className="container-fluid" style={{maxWidth: 970 + 'px'}}>
						<h1>You're all set!</h1>
					</div>
					<div className="container-fluid" style={{maxWidth: 970 + 'px'}}>
						<p align="left">
							Copy your completed form below and paste it to the forums on our sign
							up thread&nbsp;
							<a href="https://www1.flightrising.com/forums/cc/3079245">HERE</a>,
							and make any adjustments necessary to <strong>info fields only</strong>. If you need to change
							anything else, please
							fill out the form again. (Please <strong> do not change the
							the code at the bottom</strong>)
						</p>
					</div>
					<div className="container-fluid" style={{maxWidth: 970 + 'px'}}>
						<div className="md-form">
            <textarea
		            value={this.props.finalText}
		            id="completeForm"
		            className="md-textarea form-control"
		            rows="10"
		            onClick={event => this.select(event)}
            ></textarea>
						</div>
						<div className="row justify-content-center">
							<Button variant="contained" onClick={event => this.handleClick(event)}>Copy</Button>
						</div>
						<div class="d-flex justify-content-center" style={{marginTop: 1 + '%'}}>
							<div className="col d-flex justify-content-start">
								<NavButton navTo="preferences" type={"RESET"} payload={{}} text="RESET"/>
							</div>
							<div className="col d-flex justify-content-end">
								<a href="https://www1.flightrising.com/forums/cc/3079245">
									<button
											id="exitBtn"
											type="button"
											class="btn btn-success"
											disabled={this.state.dirty}
									>
										To the Forums
									</button>
								</a>
							</div>
						</div>
					</div>
				</div>
		);
	}
}

const mapStateToProps = state => ({
	finalText: state.finalText
});


const mapDispatchToProps = dispatch => ({
	loadFinalText: bindActionCreators(loadFinalText, dispatch),
	reset: bindActionCreators(reset, dispatch)
});

export const Finish = connect(
		mapStateToProps,
		mapDispatchToProps
)(FinishBase);