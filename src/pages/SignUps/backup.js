import React from "react";
import { useSignupContext } from "../../context/SignupContext";
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';

export const Backup = () => {
	const { state, dispatch } = useSignupContext();
	const { backupSanta } = state;

	const handleChange = (event) => {
		dispatch({
			type: "UPDATE_BACKUP_SANTA",
			payload: { backupSanta: event.target.checked }
		});
	};

	return (
		<div className="userIdPage">
			<div className="container-fluid" style={{ maxWidth: '970px' }}>
				<h1><strong>WOULD YOU LIKE TO BE BACKUP SANTA THIS YEAR?</strong></h1>
			</div>
			<div className="container-fluid" style={{ maxWidth: '970px' }}>
				<p align="left">
					Backup Santas may be called on to do an additional piece of artwork in
					the event that a recipient does not receive their art by the end of the event.
					Your help is greatly appreciated in making everyone's Christmas
					special, thank you! Please remember there is no obligation to do so!
				</p>
			</div>
			<div className="container-fluid" style={{ maxWidth: '970px' }}>
				<form className="row justify-content-center" style={{ maxWidth: '970px' }}>
					<div className="row container justify-content-center">
						<div className="form-check form-check-inline">
							<FormGroup>
								<FormControlLabel control={<Checkbox onChange={handleChange}
									checked={backupSanta} />}
									label="Yes, I would like to be a backup Santa this year!" />
							</FormGroup>
						</div>
					</div>
				</form>
			</div>
		</div>
	);
};

export default Backup;

