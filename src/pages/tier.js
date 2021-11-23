import { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { updateUserInfo } from "../state/formState";
// import NavButton from "../components/navbutton";

class TierBase extends Component {
  constructor(props) {
    super(props);
    this.state = {userField: "", idField: ""};
  }


  handleClick() {
    this.props.updateUserInfo({username: this.state.userField, userid: this.state.idField,})
    
  }

  updateInputValue(event) {
    this.setState({userField: event.target.value});
  }

  render() {
    return (
      <div className="tierPage">
        <div class="container-fluid" style={{maxWidth: 970 + 'px'}}>
        <h1>How much effort will you commit to your drawing this year?</h1>
      </div>
      <div class="container-fluid" style={{maxWidth: 970 + 'px'}}>
        <p align="left">
          To alleviate the pressure on those with limited time, and to reassure
          those that are planning to devote lots of time, there will be two
          tiers. <strong> tiers are NOT an indicator of <em>quality</em>, only time and effort.</strong> <br /><br />
          <strong>Tier A</strong>: For this tier, you will be expected to
          complete a full art piece. Show your recipient your best work, whether
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
      <div class="container-fluid" style={{maxWidth: 970 + 'px'}}>
        <form class="row justify-content-center" style={{maxWidth: 970 + 'px'}}>
          <div class="row container justify-content-around">
            <div class="form-check">
              <input
                class="form-check-input"
                type="radio"
                name="chosenTier"
                id="tierA"
                value="A"
                checked
              />
              <label class="form-check-label" for="tierA">
                Tier A
              </label>
            </div>
            <div class="form-check">
              <input
                class="form-check-input"
                type="radio"
                name="chosenTier"
                id="tierB"
                value="B"
              />
              <label class="form-check-label" for="tierB">
                Tier B
              </label>
            </div>
          </div>
          <br />
          <div
            class="d-flex justify-content-between container navBtns"
            style={{maxWidth: 970 + 'px'}}
          >
            <div class="col">
              <button
                type="button"
                class="btn btn-outline-danger toggleRecPrefForm"
              >
                Back
              </button>
            </div>
            <div class="col my-auto">
              4/7
            </div>
            <div class="d-flex justify-content-end">
              <button type="button" class="btn btn-success toggleTierForm">
                Next
              </button>
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
  updateUserInfo: bindActionCreators(updateUserInfo, dispatch)
});

export const Tier = connect(
  mapDispatchToProps
)(TierBase);

