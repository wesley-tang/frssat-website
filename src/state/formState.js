const INITIAL_STATE = {
  username: "",
  userid: "",
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
  submissionUuid: ""
};

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
    case "SET_UUID":
      return { ...state, uuid: action.payload.uuid};
    case "UPDATE_PREFERENCES":
      let prefs = action.payload.prefsByTier;
      prefs.banned = prefs.banned.concat(action.payload.remainingTags);
      console.log('prefs')
      console.log(prefs)
      return {
        ...state,
        prefsByTier: prefs
      };
    case "UPDATE_SUBJECTS":
      return { ...state, subjects: action.payload.subjects, noRanking: action.payload.noRanking };
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
  verifyFormIntegrity(state);

  return `[b][size=4]Information for your Secret Santa:[/size][/b]
${state.additionalInfo}

[b][size=4]Subjects[/size][/b]:
${generateSubjectText(state.subjects, state.noRanking)}

[size=1]~/${generateCode(state)}/~[/size]`;
}

function verifyFormIntegrity(state) {
  console.log(state.prefsByTier)
  if (state.prefsByTier.prefer.length === 0 && state.prefsByTier.willing.length === 0 && state.prefsByTier.banned.length === 0) {
    try {
      let prefState = JSON.parse(localStorage.getItem("prefState"));
      console.log('prefState')
      console.log(prefState)
      state.prefsByTier = prefState.tagsInTier;
      state.prefsByTier.banned = state.prefsByTier.banned.concat(prefState.usableTags);
      console.log(state.prefsByTier)
    } catch (e) {
      console.warn("FAILED TO LOAD PREFS FROM LOCAL STORAGE.")
    }
  }

  if (state.subjects.length === 0) {
    try {
      let subjectState = JSON.parse(localStorage.getItem("subjectState"));
      state.subjects = subjectState.subjects;
      state.noRanking = subjectState.noRanking;
    } catch (e) {
      console.warn("FAILED TO LOAD subjects FROM LOCAL STORAGE.")
    }
  }
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
    code += (state.noRanking ? "n" : "r" + subject.position) + "T";
    subject.tags.forEach(tag => {
      code += tag.id
    })
    code += "|"
  })
  code += "S";

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