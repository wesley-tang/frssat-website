import { useNavigate } from "react-router-dom";
import { useDispatch } from 'react-redux'
import Button from '@mui/material/Button';

//TODO SUPPORT HAVING THE BUTTON GO BACK
export default function NavButton(props) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  function handleClick() {
    dispatch({ type: props.type, payload: props.payload });
    navigate(`/${props.navTo}`);
  }

  return (
    <div className="buttonComponent">
      <Button
        id="submitUserAndPassForm"
        onClick={handleClick}
        variant={props.text === undefined ? "contained" : "outlined"}
        color={props.text === undefined ? "success" : "error"}
      >
        {props.text === undefined ? "Next" : props.text}
      </Button>
    </div>
  );
}
