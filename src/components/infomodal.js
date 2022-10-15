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
					<p>{props.tag.description}
						<br/>
						<br/>
						Example:
					</p>
					<img style={{padding: '3%'}} src={props.tag.exampleImageUrl} alt={props.tag.name + "example"}/>
					<br/>
					<small>Credit: {props.tag.imageCredit}</small>
				</Modal.Body>
			</Modal>
	);
}
