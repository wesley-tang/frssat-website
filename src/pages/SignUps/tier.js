import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import { Button, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useSignupContext } from "../../context/SignupContext";

export const Tier = () => {
	const { state, dispatch } = useSignupContext();
	const { highTier } = state;

	const [openTierA, setOpenTierA] = useState(false);
	const [openTierB, setOpenTierB] = useState(false);

	const handleChange = (event) => {
		dispatch({
			type: "UPDATE_TIER",
			payload: { tier: event.target.value }
		});
	};

	const handleClose = (modal) => {
		if (modal === "openTierA") setOpenTierA(false);
		if (modal === "openTierB") setOpenTierB(false);
	};

	const handleModalClick = (modal) => {
		if (modal === "openTierA") setOpenTierA(true);
		if (modal === "openTierB") setOpenTierB(true);
	};

	return (
		<div className="tierPage">
			<Modal show={openTierA} onHide={() => handleClose("openTierA")}>
				<Modal.Header>
					<Modal.Title>Dedicated Tier Examples</Modal.Title>
					<IconButton onClick={() => handleClose("openTierA")}>
						<CloseIcon fontSize="small" />
					</IconButton>
				</Modal.Header>

				<Modal.Body>
					<img
						style={{ padding: '3%', maxWidth: '100%' }}
						src="https://i.imgur.com/J9nbdQF.png"
						alt="example"
					/>
					<img
						style={{ padding: '3%', maxWidth: '100%' }}
						alt="example"
						src="https://i.imgur.com/5n2L3AQ.png"
					/>
					<img
						style={{ padding: '3%', maxWidth: '100%' }}
						alt="example"
						src="https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/d5ad517e-1656-4feb-891c-04fd5a88a778/ddhz8vb-f2087963-882e-4f6b-a631-00db35dac2ad.png/v1/fill/w_1280,h_1440,q_80,strp/ricky_the_emerald_wolf_by_hexylotl_ddhz8vb-fullview.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTQ0MCIsInBhdGgiOiJcL2ZcL2Q1YWQ1MTdlLTE2NTYtNGZlYi04OTFjLTA0ZmQ1YTg4YTc3OFwvZGRoejh2Yi1mMjA4Nzk2My04ODJlLTRmNmItYTYzMS0wMGRiMzVkYWMyYWQucG5nIiwid2lkdGgiOiI8PTEyODAifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uub3BlcmF0aW9ucyJdfQ.v7tk1rhTQTulAw9SDBxJqeFxi6JRHm3kmYuv6OXt9ZI"
					/>
					<small>
						Credits respectively: Hexlash, Lizzi, Hexlash
					</small>
				</Modal.Body>
			</Modal>

			<Modal show={openTierB} onHide={() => handleClose("openTierB")}>
				<Modal.Header>
					<Modal.Title>Casual Tier Examples</Modal.Title>
					<IconButton onClick={() => handleClose("openTierB")}>
						<CloseIcon fontSize="small" />
					</IconButton>
				</Modal.Header>

				<Modal.Body>
					<img style={{ padding: '3%', maxWidth: '100%' }} src="https://i.imgur.com/VNv3GhF.png" alt="example" />

					<img
						style={{ padding: '3%', maxWidth: '100%' }}
						alt="example"
						src="https://i.imgur.com/nB7Lf9F.png"
					/>
					<img
						style={{ padding: '3%', maxWidth: '100%' }}
						alt="example"
						src="https://i.imgur.com/6HFSzG6.jpeg"
					/>
					<img
						style={{ padding: '3%', maxWidth: '100%' }}
						alt="example"
						src="https://i.imgur.com/NxNeHTv.png"
					/>
					<small>
						Credits respectively: <em>Anonymous</em>, Lizzi, Eversnow, Lizzi
					</small>
				</Modal.Body>
			</Modal>

			<div className="container-fluid" style={{ maxWidth: '970px' }}>
				<h1><strong>SPECIFY HOW MUCH TIME YOU WILL COMMIT TO YOUR DRAWING</strong></h1>
			</div>
			<div className="container-fluid" style={{ maxWidth: '970px' }}>
				<p align="left">
					To alleviate the pressure on those with limited time, and to reassure
					those that are planning to devote lots of time, there will be two
					tiers. <strong> Tiers are NOT an indicator of QUALITY, only TIME.</strong>&nbsp;
					We expect that you put forth your best effort into your art.
				</p>

				<div className="row mt-4">
					<div className="col-md-6">
						<div
							className={`p-3 border rounded h-100 d-flex flex-column ${highTier ? 'border-primary' : ''}`}
							onClick={() => handleChange({ target: { value: 'a' } })}
							style={{
								cursor: 'pointer',
								transition: 'all 0.2s',
								opacity: highTier ? 1 : 0.6,
								boxShadow: highTier ? 'inset 0 0 0 2px #0d6efd' : 'none'
							}}
						>
							<div className="mb-3 text-center">
								<h4 className={`mb-0 ${highTier ? 'text-primary' : ''}`}><strong>Grand Gift</strong></h4>
								<h6 className={`mb-0 ${highTier ? 'text-primary' : ''}`}>(Dedicated)</h6>
							</div>
							<p>
								You will be expected to complete a full art piece. Show your recipient what you can do, whether
								it be through beautifully done shading, colouring, or both! There is no
								requirement on doing a full-body vs doing just a headshot, but we
								expect your best effort in terms of technique.
							</p>
							<div className="mt-auto pt-3">
								<Button
									onClick={(e) => {
										e.stopPropagation();
										handleModalClick("openTierA");
									}}
									variant="outlined"
									fullWidth
								>
									Dedicated Tier Examples
								</Button>
							</div>
						</div>
					</div>
					<div className="col-md-6">
						<div
							className={`p-3 border rounded h-100 d-flex flex-column ${!highTier ? 'border-primary' : ''}`}
							onClick={() => handleChange({ target: { value: 'b' } })}
							style={{
								cursor: 'pointer',
								transition: 'all 0.2s',
								opacity: !highTier ? 1 : 0.6,
								boxShadow: !highTier ? 'inset 0 0 0 2px #0d6efd' : 'none'
							}}
						>
							<div className="mb-3 text-center">
								<h4 className={`mb-0 ${!highTier ? 'text-primary' : ''}`}><strong>Stocking Stuffer</strong></h4>
								<h6 className={`mb-0 ${!highTier ? 'text-primary' : ''}`}>(Casual)</h6>
							</div>
							<p>
								This low-stress tier is perfect for beginners or those who may not have a lot of time to invest in the event. For
								this tier, a basic sketch is all that is expected! If you would like
								to add other additions like quick coloring or shading, then you can do
								so as well.
							</p>
							<div className="mt-auto pt-3">
								<Button
									onClick={(e) => {
										e.stopPropagation();
										handleModalClick("openTierB");
									}}
									variant="outlined"
									fullWidth
								>
									Casual Tier Examples
								</Button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Tier;
