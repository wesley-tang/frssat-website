const INITIAL_STATE = {
  username: "",
  userid: "",
  prefsByTier: {
    prefer: [],
    willing: [],
    banned: []
  },
  subjects: [],
  highTier: true,
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

export function loadFinalText() {
  return dispatch => {
    dispatch({
      type: "LOAD_FINAL_TEXT"
    });
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
    case "UPDATE_USER_INFO":
      return { ...state, username: action.payload.username, userid: action.payload.userid };
    case "UPDATE_PREFERENCES":
      let prefs = action.payload.prefsByTier;
      prefs.banned = prefs.banned.concat(action.payload.remainingTags);
      return {
        ...state,
        prefsByTier: prefs
      };
    case "UPDATE_SUBJECTS":
      return { ...state, subjects: action.payload.subjects };
    case "UPDATE_BACKUP_SANTA":
      return { ...state, backupSanta: action.payload.backupSanta };
    case "UPDATE_ADDITIONAL_INFO":
      return { ...state, additionalInfo: action.payload.infoField };
    case "UPDATE_TIER":
      return { ...state, highTier: action.payload.tier === "a" };
    case "LOAD_FINAL_TEXT":
      return { ...state, finalText: generateCopyText(state) };
    case "RESET":
      return INITIAL_STATE;
    default:
      return state;
  }
}

function generateCopyText(state) {
  return `[b]Information for your Secret Santa:[/b]
${state.additionalInfo}

[b]Subjects[/b]:
${generateSubjectText(state.subjects)}

~/${generateCode(state)}/~`;
}

function generateCode(state) {
  let code = "";

  // Could condense down to a single nested for loop using key value but that looks gross
  if (state.prefsByTier.prefer.length > 0) {
    code += "p";
    state.prefsByTier.prefer.forEach(tag => { code += tag.id })
  }

  if (state.prefsByTier.willing.length > 0) {
    code += "w";
    state.prefsByTier.willing.forEach(tag => { code += tag.id })
  }

  if (state.prefsByTier.banned.length > 0) {
    code += "b";
    state.prefsByTier.banned.forEach(tag => { code += tag.id })
  }


  code += "S";
  state.subjects.forEach(subject => {
    code += (state.noRanking ? "" : subject.position) + "t"
    subject.tags.forEach(tag => {
      code += tag.id
    })
  })

  code += "t";
  if (state.highTier) {
    code += "1";
  } else {
    code += "0";
  }

  code += "s";
  if (state.backupSanta) {
    code += "1";
  } else {
    code += "0";
  }

  return code;
}

function generateSubjectText(subjects) {
  let subjectsText = "";

  subjects.forEach(subject => {
    subjectsText += `\n
    ${subject.position ? "" : `[b]PRIORITY:[/b] ${getOrdinal(subject.position)}`}
    [b]Subject Name:[/b] ${subject.name}
    [b]Reference pictures/links:[/b] `;

    if (subject.imageUrl !== undefined) {
      subjectsText += "none"
    } else if (subject.imageUrl.endsWith("png") || subject.imageUrl.endsWith("jpg")) {
      subjectsText += `\n[img]${subject.imageUrl}[/img]`;
    }
    else { subjectsText += subject.imageUrl; }

    subjectsText += "\n[b]I would like to receive this type of art for this subject:[/b]: ";

    let tags = []
    subject.tags.forEach(tag => {
      tags.push(tag.name);
    })
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