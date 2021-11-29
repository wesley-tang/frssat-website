import * as React from 'react';
import Modal from "react-bootstrap/Modal";

import XBBCODE from "../xbbcode.js";

// import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
// import Tooltip from '@mui/material/Tooltip';
import AutocompleteInput from "../components/autocompleteinput";
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import MuiModal from '@mui/material/Modal';

export default function SubjectModal(props) {
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    //    const fancyLabel = (
    //       <div>
    //         Not an image link/Do not treat as image URL
    //         <Tooltip title="Check this if the url is not an image source that ends in .png, .jpg, etc">
    //           <HelpOutlineIcon size="small" />
    //         </Tooltip>
    //       </div>
    //     )
    let text = `
    [b]Subject Name:[/b] ${props.name}
    [b]Reference pictures/links:[/b] `;

    if (props.imageUrl !== undefined && (props.imageUrl.endsWith("png") || props.imageUrl.endsWith("jpg")))
        text += `\n[img]${props.imageUrl}[/img]`;
    else text += props.imageUrl;

    text += "\n[b]I would like to receive this type of art for this subject:[/b] ";

    let tags = []
    props.tags.forEach(tag => {
        tags.push(tag.name);
    })
    text += tags.join(", ");

    text += `\n[b]Any additional notes for this subject:[/b] ${props.info}`;

    const image =
        (props.hasImage ?
            <div className="row justify-content-center" style={{ maxWidth: 970 + 'px' }}>
                <img src={props.imageUrl} alt="Subject Reference (If you're seeing this alt text, it may be that your link is broken)" />
            </div>
            : null
        );

    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
    };

    const warning = (
        props.tags.length < 1 ? (
            <small style={{ color: "#d32f2f" }}>
                * At least one tag is needed!
            </small>)
            : null
    )

    return (
        <Modal
            show={props.editing}
            onHide={props.hideModal}
            aria-labelledby="Subject modal"
            aria-describedby="Modal for creating a subject"
        >
            <Modal.Header>
                <Modal.Title>Create a New Subject</Modal.Title>
                <IconButton onClick={props.hideModal}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Modal.Header>
            <Modal.Body>
                <MuiModal
                    open={open}
                    onClose={handleClose}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Box sx={style}>
                        <td dangerouslySetInnerHTML={{
                            __html: XBBCODE.process({
                                text: text,
                                removeMisalignedTags: false,
                                addInLineBreaks: true
                            }).html
                        }} />
                    </Box>
                </MuiModal>
                <div className="container-fluid" style={{ maxWidth: 970 + 'px' }}>
                    <div id="subjectForm1">
                        <div className="form-group container-fluid" style={{ maxWidth: 970 + 'px' }}>
                            <label>Subject Name: </label>
                            <input
                                type="text"
                                id="subjectName"
                                name="subjectName"
                                className="form-control"
                                placeholder="Subject Name"
                                onChange={props.updateNameInput}
                                value={props.name}
                            />
                        </div>
                        <div className="form-group container-fluid" style={{ maxWidth: 970 + 'px' }}>
                            <label>Subject Reference Image: </label><input
                                type="url"
                                id="subjectImg"
                                name="subjectImg"
                                className="form-control"
                                placeholder="Link to image"
                                onChange={props.updateImageUrlInput}
                                value={props.imageUrl}
                            />
                            {/* <div className="row justify-content-center" style={{ maxWidth: 970 + 'px' }}>
                                <FormGroup>
                                    <FormControlLabel control={<Checkbox onChange={event => this.handleChange(event)} checked={this.state.noRanking} />} label={this.fancyLabel()} />
                                </FormGroup>
                            </div> */}
                            {image}
                        </div>
                        <br />
                        <h5>
                            What type of art would you like for this character?
                        </h5>
                        <AutocompleteInput
                            title="Subject Tags"
                            tags={props.usableTags}
                            updateTags={props.updateTags}
                            autocomplPropPassThru={{
                                defaultValue: props.tags,
                                error: (props.tags.length < 1),
                                helperText: "Need at least one tag."
                            }}
                        />
                        {warning}
                        <br />
                        <div className="container-fluid" style={{ maxWidth: 970 + 'px' }}>
                            <div className="md-form">
                                <label>Any additional notes for this subject:</label>
                                <textarea
                                    id="subjectFree"
                                    className="md-textarea form-control"
                                    rows="5"
                                    style={{ fontSize: 14 }}
                                    onChange={props.updateInfoInput}
                                    value={props.info}
                                ></textarea>
                            </div>

                        </div>
                        <div className="container-fluid" style={{ maxWidth: 970 + 'px' }}>
                            <p align="center">
                                <small>
                                    Note: BBCode preview is not exactly the same as the forum's here (for example emojis won't appear), so please keep that
                                    in mind when you post to the forums!
                                </small>
                            </p>
                        </div>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <div className="container">
                    <div className="row">
                        <div className="col d-flex justify-content-start">
                            <Button
                                id="deleteSubject"
                                onClick={props.handleDelete}
                                variant="contained"
                                color="error"
                            >
                                Delete
                            </Button>
                        </div>
                        <div className="col d-flex justify-content-end">
                            <Button
                                id="previewSubject"
                                onClick={handleOpen}
                                variant="contained"
                                color="info"
                                sx={{ marginRight: 3 }}
                            >
                                Preview
                            </Button>
                            <Button
                                id="saveSubject"
                                onClick={props.handleSave}
                                variant="contained"
                                color="success"
                                disabled={props.tags.length < 1}
                            >
                                Save
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal.Footer>
        </Modal>
    );
}
