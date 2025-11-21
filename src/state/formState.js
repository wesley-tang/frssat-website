import { v4 as uuidv4 } from 'uuid';

const INITIAL_STATE = {
  username: "",
  userId: "",
  prefsByTier: {
    prefer: [],
    willing: [],
    banned: []
  },
  subjects: [],
  noRanking: false,
  highTier: true,
  backupSanta: false,
  additionalInfo: "",
  signupUuid: ""
};

export function loadFinalText() {
  // This thunk now receives dispatch and getState
  return (dispatch, getState) => {
    const currentState = getState().formState;

    // 1. --- THIS IS THE FIX ---
    // We check for "empty" state *here in the thunk*, not in the reducer.
    if (currentState.prefsByTier.prefer.length === 0 && currentState.subjects.length === 0) {
      try {
        const prefState = JSON.parse(localStorage.getItem("prefState"));
        const subjectState = JSON.parse(localStorage.getItem("subjectState"));
        const signupUuid = localStorage.getItem("signupUuid");

        if (prefState || subjectState || signupUuid) {
          // 2. Dispatch a NEW action to load this data
          dispatch({
            type: "RELOAD_STATE_FROM_STORAGE",
            payload: { prefState, subjectState, signupUuid }
          });
        }
      } catch (e) {
        console.warn("Failed to reload state from local storage.", e);
      }
    }

    // Check for UUID again after potential reload
    const updatedState = getState().formState;
    if (!updatedState.signupUuid) {
      const newUuid = uuidv4();
      localStorage.setItem("signupUuid", newUuid);
      dispatch({
        type: "SET_SIGNUP_UUID",
        payload: { uuid: newUuid }
      });
    }

    // 3. Finally, dispatch the original action.
    // The reducer for this is now guaranteed to be pure.
    dispatch({ type: "LOAD_FINAL_TEXT" });
  };
}

export function reset() {
  return dispatch => {
    dispatch({
      type: "RESET"
    });
  };
}

export function formState(state = INITIAL_STATE, action) {
  switch (action.type) {
    case "SET_SIGNUP_UUID":
      return { ...state, signupUuid: action.payload.uuid };
    case "SET_UUID":
      return { ...state, uuid: action.payload.uuid };
    case "UPDATE_PREFERENCES":
      return {
        ...state,
        prefsByTier: action.payload.prefsByTier
      };
    case "UPDATE_SUBJECTS":
      return { ...state, subjects: action.payload.subjects, noRanking: action.payload.noRanking };
    case "UPDATE_BACKUP_SANTA":
      return { ...state, backupSanta: action.payload.backupSanta };
    case "UPDATE_ADDITIONAL_INFO":
      return { ...state, additionalInfo: action.payload.infoField };
    case "UPDATE_TIER":
      return { ...state, highTier: action.payload.tier === "a" };
    case "RELOAD_STATE_FROM_STORAGE": {
      const { prefState, subjectState, signupUuid } = action.payload;
      return {
        ...state,
        prefsByTier: prefState ? { ...state.prefsByTier, ...prefState.tagsInTier } : state.prefsByTier,
        subjects: subjectState ? subjectState.subjects : state.subjects,
        noRanking: subjectState ? subjectState.noRanking : state.noRanking,
        signupUuid: signupUuid || state.signupUuid
      };
    }
    case "LOAD_FINAL_TEXT":
      return { ...state, finalText: generateCopyText(state) };
    case "RESET":
      return INITIAL_STATE;
    default:
      return state;
  }
}

function generateCopyText(state) {
  return `[b][size=4]Information for your Secret Santa:[/size][/b]
${state.additionalInfo}

[b][size=4]Subjects[/size][/b]:
${generateSubjectText(state.subjects, state.noRanking)}

[size=0]${state.signupUuid}[/size]`;
}


function generateSubjectText(subjects, noRanking) {
  let subjectsText = "";

  subjectsText += (noRanking ? '[b]*No preference for subject order*[/b]' : "");

  subjects.forEach(subject => {
    subjectsText += `\n
${noRanking ? "" : `[color=Darkred][b]PRIORITY:[/b][/color] ${getOrdinal(subject.position)}`}
[b][u]Subject Name[/u][/b]: ${subject.name}
[b]Reference pictures/links:[/b] `;

    if (subject.imageUrl === undefined) {
      subjectsText += "none"
    } else if (subject.imageUrl.endsWith("png") || subject.imageUrl.endsWith("jpg") || subject.imageUrl.endsWith("gif")) {
      subjectsText += `\n[img]${subject.imageUrl}[/img]`;
    }
    else { subjectsText += subject.imageUrl; }

    subjectsText += "\n[color=Darkred][b]I would like to receive this type of art for this subject:[/b][/color] ";

    let tags = []
    if (subject.mainTags) {
      subject.mainTags.forEach(tag => tags.push(tag.name));
    }
    if (subject.optionalTags) {
      subject.optionalTags.forEach(tag => tags.push(tag.name));
    }
    // Fallback for legacy subjects if needed
    if (!subject.mainTags && !subject.optionalTags && subject.tags) {
      subject.tags.forEach(tag => tags.push(tag.name));
    }
    subjectsText += tags.join(", ");

    subjectsText += `\n[b]Any additional notes for this subject:[/b] ${subject.info}`
  })

  return subjectsText;
}


function getOrdinal(n) {
  n += 1;
  let s = ["th", "st", "nd", "rd"];
  let v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}