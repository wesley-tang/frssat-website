import { Component } from "react";
import { connect } from "react-redux";
// import { bindActionCreators } from "redux";
import NavButton from "../components/navbutton";
import AutocompleteInput from "../components/autocompleteinput";

class PreferencesBase extends Component {
  constructor(props) {
    super(props);
    this.state = {
      usableTags: [{ name: "FR Dragon", id: 1 }, { name: "Humanoid", id: 2 }, { name: "Anthropomorphic", id: 3 }, { name: "Feral", id: 4 }],
      tagsInTier: {
        prefer: [],
        willing: [],
        banned: []
      }
    };
  }

  updateTags(e, newValues, reason, prefTier) {
    let newTags = this.state.usableTags.slice();

    if (reason === "selectOption") {
      const addedTag = newValues.filter(x => this.state.usableTags.includes(x));

      const index = this.state.usableTags.indexOf(addedTag[0]);
      if (index > -1) {
        newTags.splice(index, 1);
      }

    }
    else if (reason === "removeOption") {
      console.log(this.state)
      const removedTag = this.state.tagsInTier[prefTier].filter(x => !newValues.includes(x));

      newTags = this.state.usableTags.concat(removedTag[0]);
    }

    let newPrefs = { ...this.state.tagsInTier };
    newPrefs[prefTier] = newValues;

    this.setState({ ...this.state, usableTags: newTags, tagsInTier: newPrefs });
  }

  render() {
    return (
      <div className="preferencesPage">
        <div className="container-fluid" style={{ maxWidth: 970 + 'px' }}>
          <h1>Please rank your <strong>drawing preferences</strong>.</h1>
        </div>
        <div className="container-fluid" style={{ maxWidth: 970 + 'px' }}>
          <p align="left">
            In order to match you with a recipient, we would like to know what your preferences are. We will attempt to match you with someone whose subjects match your preferred tags,
            but may need to match you with subjects that you are only willing to draw. You will not be asked to draw for someone who only has subjects you do not wish to draw
            (although you may be matched with someone who has these subjects).
            Any unassigned tags will be automatically filled into "will not Draw".<br /><a
              data-toggle="modal"
              href="#rankInfo"
              className="button"
            >Help?</a
            >
            <br /><a data-toggle="modal" href="#dragInfo" className="button"
            >What's FR Dragons?</a
            >
            <br /><a data-toggle="modal" href="#humanoidInfo" className="button"
            >What's Human/Gijinka?</a
            >
            <br /><a data-toggle="modal" href="#anthroInfo" className="button"
            >What's Anthro?</a
            >
            <br /><a data-toggle="modal" href="#nonDragInfo" className="button"
            >What's Non-FR Ferals?</a
            >
          </p>
        </div>
        <div className="container-fluid" style={{ maxWidth: 970 + 'px' }}>
          <form className="container-fluid">
            <div className="row justify-content-center">
              <AutocompleteInput
                title="Prefer Drawing"
                tags={this.state.usableTags}
                autocomplPropPassThru={{ sx: { backgroundColor: '#CCFFCC' }, defaultValue: this.state.tagsInTier.prefer }}
                chipPropPassThru={{ color: 'primary' }}
                updateTags={(e, values, r) => { this.updateTags(e, values, r, "prefer") }} />
            </div>
            <div className="row justify-content-center" style={{ marginTop: 2.5 + '%', marginBottom: 2.5 + '%' }}>
              <AutocompleteInput
                title="Willing to Draw"
                tags={this.state.usableTags}
                autocomplPropPassThru={{ defaultValue: this.state.tagsInTier.willing }}
                updateTags={(e, values, r) => { this.updateTags(e, values, r, "willing") }} />
            </div>
            <div className="row justify-content-center">
              <AutocompleteInput
                title="Will not Draw"
                tags={this.state.usableTags}
                autocomplPropPassThru={{ sx: { backgroundColor: '#FFCCCC' }, defaultValue: this.state.tagsInTier.banned }}
                chipPropPassThru={{ color: 'error' }}
                updateTags={(e, values, r) => { this.updateTags(e, values, r, "banned") }} />
            </div>

            <br />
            <div
              className="d-flex justify-content-between container navBtns"

            >
              <div className="col">
                <button
                  type="button"
                  className="btn btn-outline-danger"
                  id="returnToUserAndId"
                >
                  Back
                </button>
              </div>
              <div className="col my-auto">
                2/7
              </div>
              <div className="d-flex justify-content-end">
                <NavButton navTo="backup" type={"UPDATE_PREFERENCES"} payload={{ prefsByTier: this.state.tagsInTier, remainingTags: this.state.usableTags }} />
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  tagsInTier: state.prefsByTier
});

export const Preferences = connect(
  mapStateToProps
)(PreferencesBase);

