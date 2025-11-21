import React, { useState } from "react";
import XBBCODE from "../../components/xbbcode.js";
import { BBCodeEditor } from "../../components/BBCodeEditor";
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import { useSignupContext } from "../../context/SignupContext";

export const Info = () => {
	const { state, dispatch } = useSignupContext();
	const [open, setOpen] = useState(false);

	const style = {
		position: 'absolute',
		top: '50%',
		left: '50%',
		transform: 'translate(-50%, -50%)',
		width: '80%',
		bgcolor: 'background.paper',
		boxShadow: 24,
		p: 4,
	};

	const updateInputValue = (event) => {
		dispatch({
			type: "UPDATE_ADDITIONAL_INFO",
			payload: { infoField: event.target.value }
		});
	};

	const handleOpen = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};

	const processText = () => {
		const result = XBBCODE.process({
			text: state.additionalInfo,
			removeMisalignedTags: false,
			addInLineBreaks: true
		});
		return result.html;
	};

	return (
		<div className="addtlInfoPage">
			<div className="container-fluid" style={{ maxWidth: '970px' }}>
				<h1><strong>ANY ADDITIONAL INFORMATION FOR YOUR SECRET SANTA?</strong></h1>
			</div>
			<div className="container-fluid" style={{ maxWidth: '970px' }}>
				<div className="col justify-content-center" style={{ width: '90%', margin: 'auto' }}>
					<BBCodeEditor
						id="outlined-basic"
						label="Additional Info for your Santa"
						value={state.additionalInfo}
						onChange={updateInputValue}
						textFieldProps={{
							minRows: 4,
							variant: "filled"
						}}
					/>

					<div className="container-fluid" style={{ maxWidth: '970px' }}>
						<p align="center">
							<small>
								Note: BBCode preview is not exactly the same as the forum's here (for example emojis won't appear),
								so please keep that
								in mind when you post to the forums!
							</small>
						</p>
					</div>
					<div style={{ marginTop: '1%' }}>
						<Button variant="contained" onClick={handleOpen}>Preview</Button>
						<Modal
							open={open}
							onClose={handleClose}
							aria-labelledby="modal-modal-title"
							aria-describedby="modal-modal-description"
						>
							<Box sx={style}>
								<div dangerouslySetInnerHTML={{ __html: processText() }} />
							</Box>
						</Modal>
					</div>
				</div>
			</div>
		</div>
	);
};
