import { useNavigate } from "react-router-dom";
import { useDispatch } from 'react-redux'

//TODO SUPPORT HAVING THE BUTTON GO BACK
export default function NavButton(props) {
  const navigate = useNavigate();
  const dispatch = useDispatch()

  function handleClick() {
    dispatch({type: props.type, payload: props.payload});
    navigate(`/${props.navTo}`);
  }

  return (
    <div className="buttonComponent">
      <button
        type="button"
        className="btn btn-success"
        id="submitUserAndPassForm"
        onClick={handleClick}
      >
        Next
      </button>
    </div>
  );
}
