import { Component } from "react";
import { connect } from "react-redux";

import XBBCODE from "../components/xbbcode.js";

import TextField from '@mui/material/TextField';
import NavButton from "../components/navbutton";
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';

class InfoBase extends Component {
  constructor(props) {
    super(props);
    this.state = { infoField: "", open: false };
  }

  style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80%',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
  };

  updateInputValue(event) {
    this.setState({ infoField: event.target.value });
  }

  handleOpen(event) {
    this.setState({open: true });
  }

  handleClose(event) {
    this.setState({open: false });
  }

  processText() {
    const result = XBBCODE.process({
      text: this.state.infoField,
      removeMisalignedTags: false,
      addInLineBreaks: true
    });
    console.log("Errors: " + result.error);
    console.dir(result.errorQueue);
    return result.html;
  }

  render() {

    return (
      <div className="addtlInfoPage">
        <div className="container-fluid" style={{ maxWidth: 970 + 'px' }}>
          <h1>Any additional information for your Secret Santa?</h1>
        </div>
        <div className="container-fluid" style={{ maxWidth: 970 + 'px' }}>
          <div className="col justify-content-center" style={{ width: 90 + '%', margin: 'auto' }}>
            <TextField
              id="outlined-basic"
              label="Additional Info for your Santa"
              minRows={4}
              onChange={event => this.updateInputValue(event)}
              fullWidth
              multiline
              variant="filled" />
            <div className="container-fluid" style={{ maxWidth: 970 + 'px' }}>
              <p align="center">
                <small>
                  Note: BBCode preview is not exactly the same as the forum's here (for example emojis won't appear), so please keep that
                  in mind when you post to the forums!
                </small>
              </p>
            </div>
            <div style={{ marginTop: 1 + '%' }}>
              <Button variant="contained" onClick={event => this.handleOpen(event)}>Preview</Button>
              <Modal
                open={this.state.open}
                onClose={event => this.handleClose(event)}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
              >
                <Box sx={this.style}>
                  <td dangerouslySetInnerHTML={{ __html: this.processText() }} />
                </Box>
              </Modal>
            </div>
          </div>

            <br />
            <div
              className="d-flex justify-content-between container navBtns"
            >
              <div className="col">
                {/* <button
                  type="button"
                  className="btn btn-outline-danger toggleBackupSantaForm"
                >
                  Back
                </button> */}
              </div>
              <div className="col my-auto">
                5/5
              </div>
              <div className="col d-flex justify-content-end">
                <NavButton navTo="finish" type={"UPDATE_ADDITIONAL_INFO"} payload={{ infoField: this.state.infoField }} />
              </div>
            </div>
        </div>
      </div>
    );
  }
}

InfoBase.defaultProps = {
  infoField: ""
}

export const Info = connect(
)(InfoBase);

