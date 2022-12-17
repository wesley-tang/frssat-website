import {useNavigate} from "react-router-dom";


export default function Submissions() {
	const navigate = useNavigate();

	function handleNewSubmissionClick() {
		navigate("/submissionForm");
	}

	// function handleEditSubmissionClick() {
	// 	navigate("/editSubmission");
	// }

	return (
			<div className="submissionsPage">
				<div className="container-fluid" style={{maxWidth: 970 + 'px', paddingTop: 2 + "%"}}>
					<h1 style={{margin: 0}}><strong>SUBMISSIONS</strong></h1>
				</div>
				<div className="container-fluid" style={{paddingTop: 2 + '%'}}>
					<p style={{maxWidth: 750 + 'px'}}>
						Please select whether you want to edit an existing submission or create a new one.
					</p>
				</div>
				<br/>
				<div className="row justify-content-center">
					<div className="col-md-auto">
						<button
								disabled
								type="button"
								className="btn btn-primary"
								onClick={handleNewSubmissionClick}
								style={{marginBottom: 5 + '%'}}
						>
							Edit Submissions
						</button>
					</div>
					<div className={"col-md-auto"}>
						<button
								type="button"
								className="btn btn-primary"
								onClick={handleNewSubmissionClick}
								style={{marginBottom: 5 + '%'}}
						>
							New Submission
						</button>
					</div>
				</div>
			</div>
	);
}
