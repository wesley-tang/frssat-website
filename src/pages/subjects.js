import { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { updateUserInfo } from "../state/formState";
import NavButton from "../components/navbutton";

class SubjectsBase extends Component {
  constructor(props) {
    super(props);
    this.state = { userField: "", idField: "" };
  }

  updateInputValue(event) {
    this.setState({ userField: event.target.value });
  }

  render() {
    return (
      <div className="subjectsPage">
        <div className="container-fluid" style={{ maxWidth: 970 + 'px' }}>
          <h1>Please add the subjects you want drawn</h1>
        </div>
        <div className="container-fluid">
          <p align="center">
            TODO ;-;
            
          </p>
        </div>
        <div className="container-fluid" style={{ maxWidth: 970 + 'px' }}>
          <div className="row justify-content-center" style={{ maxWidth: 970 + 'px' }}>

            <br />
            <div
              className="row navBtns container justify-content-center"
              style={{ maxWidth: 970 + 'px' }}
            >
              <div className="col">
              </div>
              <div className="col my-auto">
                2/5
              </div>
              <div className="col d-flex justify-content-end">
                <NavButton navTo="tier" type={"UPDATE_SUBJECTS"} payload={{}} />
              </div>
            </div>
          </div>
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

export const Subjects = connect(
  mapDispatchToProps
)(SubjectsBase);

