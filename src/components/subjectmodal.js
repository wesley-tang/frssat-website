import * as React from 'react';
import Modal from "react-bootstrap/Modal";

import XBBCODE from "./xbbcode.js";
import { BBCodeEditor } from "./BBCodeEditor";

import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import Tooltip from '@mui/material/Tooltip';
import AutocompleteInput from "../components/autocompleteinput";
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import MuiModal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';

export default function SubjectModal(props) {
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    // Local state for debouncing
    const [localName, setLocalName] = React.useState(props.name);
    const [localImageUrl, setLocalImageUrl] = React.useState(props.imageUrl);
    const [localInfo, setLocalInfo] = React.useState(props.info);

    // Sync local state with props when they change (e.g. opening modal for different subject)
    // We only want to sync if the prop value is different from our local state, 
    // which happens when switching subjects or if the parent updates from another source.
    // However, to avoid fighting with the debounce, we might want to only sync when the modal opens?
    // Or just trust that if they match, no harm done.
    React.useEffect(() => {
        setLocalName(props.name);
    }, [props.name]);

    React.useEffect(() => {
        setLocalImageUrl(props.imageUrl);
    }, [props.imageUrl]);

    React.useEffect(() => {
        setLocalInfo(props.info);
    }, [props.info]);

    // Debounce effects
    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (localName !== props.name) {
                props.updateNameInput({ target: { value: localName } });
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [localName, props.name, props.updateNameInput]);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (localImageUrl !== props.imageUrl) {
                props.updateImageUrlInput({ target: { value: localImageUrl } });
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [localImageUrl, props.imageUrl, props.updateImageUrlInput]);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (localInfo !== props.info) {
                props.updateInfoInput({ target: { value: localInfo } });
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [localInfo, props.info, props.updateInfoInput]);


    let text = "";
    text += `[b][u]Subject Name[/u][/b]: ${localName}
[b]Reference pictures/links:[/b] `;

    if (localImageUrl === undefined) {
        text += "none"
    } else if (localImageUrl.endsWith("png") || localImageUrl.endsWith("jpg") || localImageUrl.endsWith("gif")) {
        text += `\n[img]${localImageUrl}[/img]`;
    }
    else { text += localImageUrl; }

    text += "\n[b]I would like to receive this type of art for this subject:[/b] ";

    let tags = []
    props.mainTags.forEach(tag => {
        tags.push(tag.name);
    })
    props.optionalTags.forEach(tag => {
        tags.push(tag.name);
    })
    text += tags.join(", ");

    text += `\n[b]Any additional notes for this subject:[/b] ${localInfo}`;

    const image =
        (props.hasImage ?
            <div className="row justify-content-center" style={{ maxWidth: 970 + 'px' }}>
                <img src={localImageUrl} alt="Subject Reference (If you're seeing this alt text, it may be that your link is broken)" />
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

    const requiredTagCount = props.mainTags.filter(t => t.required).length;
    const validationError = requiredTagCount !== 1;

    const warning = (
        validationError ? (
            <small style={{ color: "#d32f2f" }}>
                * You must provide ONE tag that is labelled as required.
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
                                onChange={(e) => setLocalName(e.target.value)}
                                value={localName}
                            />
                        </div>
                        <div className="form-group container-fluid" style={{ maxWidth: 970 + 'px' }}>
                            <Tooltip disableFocusListener title="Links ending in png, jpg or gif will render.">
                                <HelpOutlineOutlinedIcon fontSize="10" />
                            </Tooltip>
                            <label>&nbsp;Subject Reference Image: </label>
                            <input
                                type="url"
                                id="subjectImg"
                                name="subjectImg"
                                className="form-control"
                                placeholder="Link to image"
                                onChange={(e) => setLocalImageUrl(e.target.value)}
                                value={localImageUrl}
                            />
                            {image}
                        </div>
                        <br />

                        <div className="form-group container-fluid" style={{ maxWidth: 970 + 'px' }}>
                            <h5><Tooltip disableFocusListener title="This includes tags for which you have no reference art, though we recommend it or a written description, if possible.">
                                <HelpOutlineOutlinedIcon fontSize="10" />
                            </Tooltip>
                                &nbsp;What type of art would you like for this character?
                            </h5>

                            <Typography variant="caption" display="block" gutterBottom>
                                <b>If a Santa bans any of these tags they will not match with this character.</b>
                            </Typography>
                            <AutocompleteInput
                                title="*Main Tags (1-3)"
                                tags={props.usableTags.filter(t => !props.mainTags.some(mt => mt.required) || !t.required)}
                                updateTags={props.updateMainTags}
                                autocomplPropPassThru={{
                                    defaultValue: props.mainTags,
                                    value: props.mainTags,
                                    error: validationError,
                                    helperText: "Must have exactly one required tag."
                                }}
                                boldRequired={true}
                                chipVariant="filled"
                                width="100%"
                            />
                            {warning}
                            <br />

                            <Typography variant="caption" display="block" gutterBottom>
                                Alternate/optional or non-critical traits you want drawn.
                            </Typography>
                            <AutocompleteInput
                                title="Optional Tags"
                                tags={props.usableTags}
                                updateTags={props.updateOptionalTags}
                                autocomplPropPassThru={{
                                    defaultValue: props.optionalTags,
                                    value: props.optionalTags
                                }}
                                chipVariant="outlined"
                                width="100%"
                                inputVariant="standard"
                            />
                        </div>

                        <br />
                        <div className="container-fluid" style={{ maxWidth: 970 + 'px' }}>
                            <BBCodeEditor
                                id="outlined-basic"
                                label="Any additional notes for this subject:"
                                value={localInfo}
                                onChange={(e) => setLocalInfo(e.target.value)}
                                textFieldProps={{
                                    minRows: 5,
                                    variant: "filled"
                                }}
                            />
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
                                disabled={validationError}
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
