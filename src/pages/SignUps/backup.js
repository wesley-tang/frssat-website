import {Component} from "react";
import {connect} from "react-redux";
import NavButton from "../../components/navbutton";
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';

class BackupBase extends Component {
	constructor(props) {
		super(props);
		let backupState = null;
		try {
			backupState = JSON.parse(localStorage.getItem("backupState"));
		} catch (e) {
			console.warn("FAILED TO LOAD FROM LOCAL STORAGE.")
		}
		if (backupState === null) {
			this.state = {
				backupSanta: false
			};
		} else {
			this.state = backupState;
		}
	}


	handleChange(event) {
		this.setState({backupSanta: !this.state.backupSanta})
	}

	render() {
		return (
				<div className="userIdPage">
					<div className="container-fluid" style={{maxWidth: 970 + 'px'}}>
						<h1><strong>WOULD YOU LIKE TO BE BACKUP SANTA THIS YEAR?</strong></h1>
					</div>
					<div className="container-fluid" style={{maxWidth: 970 + 'px'}}>
						<p align="left">
							Backup Santas may be called on to do an additional piece of artwork in
							the event that a recipient does not receive their art by the end of the event.
							Your help is greatly appreciated in making everyone's Christmas
							special, thank you! Please remember there is no obligation to do so!
						</p>
					</div>
					<div className="container-fluid" style={{maxWidth: 970 + 'px'}}>
						<form className="row justify-content-center" style={{maxWidth: 970 + 'px'}}>
							<div className="row container justify-content-center">
								<div className="form-check form-check-inline">
									<FormGroup>
										<FormControlLabel control={<Checkbox onChange={event => this.handleChange(event)}
										                                     checked={this.state.backupSanta}/>}
										                  label="Yes, I would like to be a backup Santa this year!"/>
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
											navTo="tier"
											type={"UPDATE_BACKUP_SANTA"}
											pageStateKey={"backupState"}
											pageState={this.state}
											text={"Back"}
											payload={{backupSanta: this.state.backupSanta}}/>
								</div>
								<div className="col my-auto">
									4/5
								</div>
								<div className="col d-flex justify-content-end">
									<NavButton
											navTo="info"
											type={"UPDATE_BACKUP_SANTA"}
											pageStateKey={"backupState"}
											pageState={this.state}
											payload={{backupSanta: this.state.backupSanta}}/>
								</div>
							</div>
						</form>
					</div>
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

export const Backup = connect(
		mapDispatchToProps
)(BackupBase);

