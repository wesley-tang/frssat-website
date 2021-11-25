const INITIAL_STATE = {
  username: "",
  userid: "",
  prefsByTier: {
    prefer: [],
    willing: [],
    banned: []
  },
  backupSanta: false,
  additionalInfo: ""
};

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
      console.log()
      let prefs = action.payload.prefsByTier;
      prefs.banned = prefs.banned.concat(action.payload.remainingTags);
      return {
        ...state,
        prefsByTier: prefs
      };
    case "UPDATE_USER_INFO":
      return { ...state, username: action.payload.username, userid: action.payload.userid };
      case "UPDATE_BACKUP_SANTA":
        return { ...state, backupSanta: action.payload.backupSanta };
        case "UPDATE_ADDITIONAL_INFO":
          return { ...state, additionalInfo: action.payload.infoField };
    default:
      return state;
  }
}
