import {useNavigate} from "react-router-dom";
import {useDispatch} from 'react-redux'
import Button from '@mui/material/Button';

export default function NavButton(props) {
	const navigate = useNavigate();
	const dispatch = useDispatch();

	function handleClick() {
		if (props.text === "RESET") {
			localStorage.clear();
		} else if (props.pageStateKey !== null) {
			try {
				localStorage.setItem(props.pageStateKey, JSON.stringify(props.pageState));
			} catch (e) {
				console.warn("FAILED TO SAVE STATE. PROGRESS NOT SAVED.")
			}
		}
		dispatch({type: props.type, payload: props.payload});
		navigate(`/${props.navTo}`);
	}

	return (
			<div className="buttonComponent">
				<Button
						id="submitUserAndPassForm"
						onClick={handleClick}
						variant={props.text === undefined ? "contained" : "outlined"}
						color={props.text === undefined ? "success" : "error"}
						{...props.passThrough || {}}
				>
					{props.text === undefined ? "Next" : props.text}
				</Button>
			</div>
	);
}
