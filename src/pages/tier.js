import { Component } from "react";
import { connect } from "react-redux";
import NavButton from "../components/navbutton";

import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

class TierBase extends Component {
  constructor(props) {
    super(props);
    this.state = { tier: "a" };
  }


  handleChange(event) {
    this.setState({ tier: event.target.value });
  }

  render() {
    return (
      <div className="tierPage">
        <div class="container-fluid" style={{ maxWidth: 970 + 'px' }}>
          <h1>How much time will you commit to your drawing this year?</h1>
        </div>
        <div class="container-fluid" style={{ maxWidth: 970 + 'px' }}>
          <p align="left">
            To alleviate the pressure on those with limited time, and to reassure
            those that are planning to devote lots of time, there will be two
            tiers. <strong> tiers are NOT an indicator of <em>quality</em>, only time.</strong>
            We expect that you put forth your best effort into your art.<br /><br />
            <strong>Tier A</strong>: You will be expected to
            complete a full art piece. Show your recipient what you can do, whether
            it be through beautifully done shading, coloring, or both! There is no
            requirement on doing a fullbody vs doing just a headshot, but we
            expect your best effort in terms of technique.
            <a data-toggle="modal" href="#tierAEx" class="button"
            >Tier A Examples</a
            ><br /><br />
            <strong>Tier B</strong>: This low-stress tier is perfect for beginners
            or those who may not have a lot of time to invest in the event. For
            this tier, a basic sketch is all that is expected! If you would like
            to add other additions like quick coloring or shading, then you can do
            so as well.
            <a data-toggle="modal" href="#tierBEx" class="button"
            >Tier B Examples</a
            >
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

