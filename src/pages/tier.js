import { Component } from "react";
import { connect } from "react-redux";
import NavButton from "../components/navbutton";

import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Modal from "react-bootstrap/Modal";
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';

class TierBase extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tier: "a",
      openTierA: false,
      openTierB: false
    };
  }

  handleModalClick(modalToOpen) {
    let newState = {};
    newState[modalToOpen] = true;
    this.setState(newState);
  }

  handleClose(modalToClose) {
    let newState = {};
    newState[modalToClose] = false;
    this.setState(newState);
  }

  handleChange(event) {
    this.setState({ tier: event.target.value });
  }

  render() {
    return (
      <div className="tierPage">
        <Modal show={this.state.openTierA} onHide={() => { this.handleClose("openTierA") }}>
          <Modal.Header>
            <Modal.Title>Tier A Examples</Modal.Title>
            <IconButton onClick={() => { this.handleClose("openTierA") }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Modal.Header>

          <Modal.Body>
            <img
              style={{ padding: '3%' }}
              src="https://cdn.discordapp.com/attachments/367956474548322318/631362965135687691/unknown.png"
              alt="example"
            />
            <img
              style={{ padding: '3%' }}
              alt="example"
              src="https://cdn.discordapp.com/attachments/503665292057116679/635028826820182016/maila600_by_friedsnipe-dcfxin1.png"
            />
            <img
              style={{ padding: '3%' }}
              alt="example"
              src="https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/d5ad517e-1656-4feb-891c-04fd5a88a778/ddhz8vb-f2087963-882e-4f6b-a631-00db35dac2ad.png/v1/fill/w_1280,h_1440,q_80,strp/ricky_the_emerald_wolf_by_hexylotl_ddhz8vb-fullview.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTQ0MCIsInBhdGgiOiJcL2ZcL2Q1YWQ1MTdlLTE2NTYtNGZlYi04OTFjLTA0ZmQ1YTg4YTc3OFwvZGRoejh2Yi1mMjA4Nzk2My04ODJlLTRmNmItYTYzMS0wMGRiMzVkYWMyYWQucG5nIiwid2lkdGgiOiI8PTEyODAifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uub3BlcmF0aW9ucyJdfQ.v7tk1rhTQTulAw9SDBxJqeFxi6JRHm3kmYuv6OXt9ZI"
            />
            <small>
              Credits respectively: Hexlash, Lizzi, Hexlash
            </small>
          </Modal.Body>
        </Modal>

        <Modal show={this.state.openTierB} onHide={() => { this.handleClose("openTierB") }}>
          <Modal.Header>
            <Modal.Title>Tier B Examples</Modal.Title>
            <IconButton onClick={() => { this.handleClose("openTierB") }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Modal.Header>

          <Modal.Body>
            <img style={{ padding: '3%' }} src="https://i.imgur.com/VNv3GhF.png" alt="example" />

            <img
              style={{ padding: '3%' }}
              alt="example"
              src="https://media.discordapp.net/attachments/503665292057116679/635025793420099595/DvaINPUVYAAz_9G.png"
            />
            <img
              style={{ padding: '3%' }}
              alt="example"
              src="https://cdn.discordapp.com/attachments/568166311687880704/635027821085065232/IMG_20191017_235500.jpg"
            />
            <img
              style={{ padding: '3%' }}
              alt="example"
              src="https://cdn.discordapp.com/attachments/503665292057116679/635030438242418698/120ea90f26a0753f2aa92c2eaba21777.png"
            />
            <small>
              Credits respectively: <em>Anonymous</em>, Lizzi, Eversnow, Lizzi
            </small>
          </Modal.Body>
        </Modal>
        <div class="container-fluid" style={{ maxWidth: 970 + 'px' }}>
          <h1>How much time will you commit to your drawing this year?</h1>
        </div>
        <div class="container-fluid" style={{ maxWidth: 970 + 'px' }}>
          <p align="left">
            To alleviate the pressure on those with limited time, and to reassure
            those that are planning to devote lots of time, there will be two
            tiers. <strong> Tiers are NOT an indicator of <em>quality</em>, only time.</strong>&nbsp;
            We expect that you put forth your best effort into your art.<br /><br />
            <strong>Tier A</strong>: You will be expected to
            complete a full art piece. Show your recipient what you can do, whether
            it be through beautifully done shading, coloring, or both! There is no
            requirement on doing a fullbody vs doing just a headshot, but we
            expect your best effort in terms of technique.
            <br />
            <Button onClick={() => { this.handleModalClick("openTierA") }} variant="text">Tier A Examples</Button>
            <br /><br />
            <strong>Tier B</strong>: This low-stress tier is perfect for beginners
            or those who may not have a lot of time to invest in the event. For
            this tier, a basic sketch is all that is expected! If you would like
            to add other additions like quick coloring or shading, then you can do
            so as well.
            <br />
            <Button onClick={() => { this.handleModalClick("openTierB") }} variant="text">Tier B Examples</Button>
          </p>
        </div>
        <div class="container-fluid" style={{ maxWidth: 970 + 'px' }}>
          <form class="row justify-content-center" style={{ maxWidth: 970 + 'px' }}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Tier</FormLabel>
              <RadioGroup
                row
                aria-label="tier"
                name="row-radio-buttons-group"
                defaultValue={this.state.tier}
                value={this.state.tier}
                onChange={(event) => this.handleChange(event)}
              >
                <FormControlLabel value="a" control={<Radio />} label="A" />
                <FormControlLabel value="b" control={<Radio />} label="B" />
              </RadioGroup>
            </FormControl>
            <br />
            <div
              class="d-flex justify-content-between container navBtns"
              style={{ maxWidth: 970 + 'px' }}
            >
              <div class="col">
                {/* <button
                type="button"
                class="btn btn-outline-danger toggleRecPrefForm"
              >
                Back
              </button> */}
              </div>
              <div class="col my-auto">
                3/5
              </div>
              <div class="col d-flex justify-content-end">
                <NavButton navTo="backup" type={"UPDATE_TIER"} payload={this.state} />
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export const Tier = connect(
)(TierBase);

