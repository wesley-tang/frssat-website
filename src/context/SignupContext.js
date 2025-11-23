import React, { createContext, useContext, useReducer, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';

const SignupContext = createContext();

export const useSignupContext = () => {
    return useContext(SignupContext);
};

const INITIAL_STATE = {
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
    signupUuid: "",
    isInitialized: false
};

function signupReducer(state, action) {
    switch (action.type) {
        case "SET_SIGNUP_UUID":
            return { ...state, signupUuid: action.payload.uuid };
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
            const { prefState, subjectState, signupUuid, infoState, tierState, backupState } = action.payload;
            return {
                ...state,
                prefsByTier: prefState ? { ...state.prefsByTier, ...prefState.tagsInTier } : state.prefsByTier,
                subjects: subjectState ? subjectState.subjects : state.subjects,
                noRanking: subjectState ? subjectState.noRanking : state.noRanking,
                signupUuid: signupUuid || state.signupUuid,
                additionalInfo: infoState ? infoState.infoField : state.additionalInfo,
                highTier: tierState ? tierState.tier === "a" : state.highTier,
                backupSanta: backupState ? backupState.backupSanta : state.backupSanta,
                isInitialized: true
            };
        }
        case "INITIALIZATION_COMPLETE":
            return { ...state, isInitialized: true };
        case "RESET":
            return { ...INITIAL_STATE, isInitialized: true, signupUuid: state.signupUuid }; // Keep UUID and Init on reset? Usually yes.
        default:
            return state;
    }
}

export const SignupContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(signupReducer, INITIAL_STATE);

    // Load from local storage on mount
    useEffect(() => {
        try {
            const prefState = JSON.parse(localStorage.getItem("prefState"));
            const subjectState = JSON.parse(localStorage.getItem("subjectState"));
            const infoState = JSON.parse(localStorage.getItem("infoState"));
            const tierState = JSON.parse(localStorage.getItem("tierState"));
            const backupState = JSON.parse(localStorage.getItem("backupState"));
            const signupUuid = localStorage.getItem("signupUuid");

            if (prefState || subjectState || infoState || tierState || backupState || signupUuid) {
                dispatch({
                    type: "RELOAD_STATE_FROM_STORAGE",
                    payload: { prefState, subjectState, infoState, tierState, backupState, signupUuid }
                });
            } else {
                dispatch({ type: "INITIALIZATION_COMPLETE" });
            }

            if (!signupUuid && !localStorage.getItem("signupUuid")) {
                const newUuid = uuidv4();
                localStorage.setItem("signupUuid", newUuid);
                dispatch({ type: "SET_SIGNUP_UUID", payload: { uuid: newUuid } });
            } else if (!signupUuid && localStorage.getItem("signupUuid")) {
                dispatch({ type: "SET_SIGNUP_UUID", payload: { uuid: localStorage.getItem("signupUuid") } });
            }

            // Ensure initialization is marked complete if we didn't reload (e.g. fresh start)
            // Actually the else block above handles it. 
            // But if we did reload, RELOAD sets it.
            // So we are good.

        } catch (e) {
            console.warn("Failed to reload state from local storage.", e);
            dispatch({ type: "INITIALIZATION_COMPLETE" });
        }
    }, []);

    // Save to local storage on state change
    useEffect(() => {
        if (!state.isInitialized) return;

        if (state.prefsByTier) {
            localStorage.setItem("prefState", JSON.stringify({ tagsInTier: state.prefsByTier }));
        }
        if (state.subjects) {
            localStorage.setItem("subjectState", JSON.stringify({ subjects: state.subjects, noRanking: state.noRanking }));
        }
        // infoState expects { infoField: ... }
        localStorage.setItem("infoState", JSON.stringify({ infoField: state.additionalInfo }));

        // tierState expects { tier: "a" | "b" }
        localStorage.setItem("tierState", JSON.stringify({ tier: state.highTier ? "a" : "b" }));

        // backupState expects { backupSanta: boolean }
        localStorage.setItem("backupState", JSON.stringify({ backupSanta: state.backupSanta }));

        if (state.signupUuid) {
            localStorage.setItem("signupUuid", state.signupUuid);
        }
    }, [state]);

    // Validation Logic
    const validation = useMemo(() => {
        const errors = {};

        // Preferences Validation
        const hasRequiredInPrefer = state.prefsByTier.prefer.some(t => t.required);
        const hasRequiredInWilling = state.prefsByTier.willing.some(t => t.required);

        if (!hasRequiredInPrefer && !hasRequiredInWilling) {
            errors.preferences = "You must include at least one main tag (denoted by a *) in 'Prefer Drawing' or 'Willing to Draw'.";
        }

        // Subjects Validation
        if (state.subjects.length === 0) {
            errors.subjects = "You must add at least one subject.";
        } else {
            const hasInvalidSubjects = state.subjects.some(s =>
                !s.mainTags ||
                s.mainTags.filter(t => t.required).length !== 1
            );
            if (hasInvalidSubjects) {
                errors.subjects = "One or more subjects are missing required tags.";
            }
        }

        return { errors };
    }, [state]);

    const generateFinalText = () => {
        return `[b][size=4]Information for your Secret Santa:[/size][/b]
${state.additionalInfo}

[b][size=4]Subjects[/size][/b]:
${generateSubjectText(state.subjects, state.noRanking)}

[size=0]${state.signupUuid}[/size]`;
    };

    return (
        <SignupContext.Provider value={{ state, dispatch, validation, generateFinalText }}>
            {children}
        </SignupContext.Provider>
    );
};

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
