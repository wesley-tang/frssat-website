import Modal from "react-bootstrap/Modal";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

export default function InfoModal(props) {
	return (
			<Modal show={props.openModelFlag} onHide={props.handleClose}>
				<Modal.Header>
					<Modal.Title>What is {props.tag.name}</Modal.Title>
					<IconButton onClick={props.handleClose}>
						<CloseIcon fontSize="small"/>
					</IconButton>
				</Modal.Header>
				<Modal.Body>
					<p>{props.tag.description ? props.tag.description : <em>No description provided</em>}</p>
					{props.tag.exampleImageUrl !== undefined &&
						<p>
							<br/>
							Example:
							<img style={{padding: '3%', display: 'block'}} class="center" src={props.tag.exampleImageUrl} alt={props.tag.name + "example image"}/>
							{props.tag.imageCredit !== undefined &&
								<small>Credit: {props.tag.imageCredit}</small>
							}
						</p>
					}
				</Modal.Body>
			</Modal>
	);
}
