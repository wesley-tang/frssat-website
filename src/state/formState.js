const INITIAL_STATE = {
  username: "",
  userid: ""
};

export function loadTodos() {
  
}

export function updateUserInfo(userInfo) {
  return dispatch => {
      dispatch({
        type: "UPDATE_USER_INFO",
        payload: userInfo
      });
  };
}

export function formState(state = INITIAL_STATE, action) {
  switch (action.type) {
    case "UPDATE_PREFERENCES":
      let prefsbyTier = action.payload.prefsbyTier;
      prefsbyTier.banned = prefsbyTier.banned.concat(action.payload.remainingTags);
      return {
        ...state,
        prefsbyTier: prefsbyTier
      };
    case "LIST_TODOS":
      return {...state, list: action.payload};
    case "UPDATE_USER_INFO":
      return {...state, username: action.payload.username, userid: action.payload.userid };
    default:
      return state;
  }
}
