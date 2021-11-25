import { Component } from "react";
import { connect } from "react-redux";
import NavButton from "../components/navbutton";

class UserIdBase extends Component {
  constructor(props) {
    super(props);
    this.state = {userField: "", idField: ""};
  }

  updateInputValue(event) {
    this.setState({userField: event.target.value});
  }

  render() {
    return (
      <div className="userIdPage">
        <div className="container-fluid" style={{maxWidth: 970 + 'px'}}>
          <h1>What is your Flight Rising Username and ID number?</h1>
        </div>
        <div className="container-fluid">
          <p align="center">
            We need your Username and ID to identify you and contact you
            throughout the event!
            <a data-toggle="modal" href="#userInfo" className="button">Help?</a>
          </p>
        </div>
        <div className="container-fluid" style={{maxWidth: 970 + 'px'}}>
          <form className="row justify-content-center" style={{maxWidth: 970 + 'px'}}>
            <div className="row container justify-content-center">
              <div className="col">
                <input
                  type="text"
                  id="username"
                  name="username"
                  className="form-control"
                  placeholder="Username"
                  onChange={event => this.updateInputValue(event)} value={this.state.userField}
                />
              </div>
              <h2>#</h2>
              <div className="col-4">
                <input
                  type="number"
                  id="userId"
                  name="userId"
                  className="form-control"
                  placeholder="123456"
                />
              </div>
            </div>
            <br />
            <div
              className="row navBtns container justify-content-center"
              style={{maxWidth: 970 + 'px'}}
            >
              <div className="col">
              </div>
              <div className="col my-auto">
                1/7
              </div>
              <div className="d-flex justify-content-end">
                <NavButton navTo="preferences" type={"UPDATE_USER_INFO"} payload={{username: this.state.userField, userid: this.state.idField}}/>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

UserIdBase.defaultProps = {
  userField: ""
}

export const UserId = connect(
)(UserIdBase);

