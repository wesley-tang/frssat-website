export default function Finish() {


  return (
    <div className="finishPage">
      <div class="container-fluid" style="max-width: 970px;">
        <h1>You're all set!</h1>
      </div>
      <div class="container-fluid" style="max-width: 970px;">
        <p align="left">
          Copy your completed form below and paste it to the forums on our sign
          up thread
          <a href="https://www1.flightrising.com/forums/cc/2928940">HERE</a>,
          and make any adjustments necessary! (We advise you <strong>not to change the
          formatting of anything above the dividing line</strong> besides the Additional
          Info field please!)
        </p>
      </div>
      <div class="container-fluid" style="max-width: 970px;">
        <div class="md-form">
          <textarea
            readonly
            id="completeForm"
            class="md-textarea form-control"
            rows="10"
            onclick="this.focus();this.select()"
          ></textarea>
        </div>
        <div class="row justify-content-center">
          <button type="button" class="btn btn-primary" id="copyBtn">
            Copy
          </button>
        </div>
      </div>
    </div>
  );
}
