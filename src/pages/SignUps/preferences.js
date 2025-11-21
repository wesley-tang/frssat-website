
import React, { useState, useEffect, useMemo } from "react";

import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

import AutocompleteInput from "../../components/autocompleteinput";
import InfoModal from "../../components/infomodal";

// --- 1. Import the Context Hook ---
import { useActiveEventContext } from "../../context/EventContext";
import { useSignupContext } from "../../context/SignupContext";

export const Preferences = () => {
	// --- 2. Get Active Event Data ---
	const { activeEvent } = useActiveEventContext() || {};
	const { state, dispatch } = useSignupContext();

	// State for modals (using a Map or Object to track open status)
	const [modalOpenState, setModalOpenState] = useState({});

	// --- 4. Initialize Data (Effect) ---
	useEffect(() => {
		// Verify we have event data before proceeding
		if (!activeEvent) return;

		const eventTags = activeEvent.tags || [];

		// Initialize modal state only if empty (on mount)
		setModalOpenState(prev => {
			if (Object.keys(prev).length > 0) return prev;
			const initialModals = {};
			eventTags.forEach(tag => {
				initialModals["open" + tag.name] = false;
			});
			return initialModals;
		});

	}, [activeEvent]);

	// Calculate usable tags (Derived State)
	const usableTags = useMemo(() => {
		if (!activeEvent || !activeEvent.tags) return [];

		const usedTags = [
			...state.prefsByTier.prefer,
			...state.prefsByTier.willing,
			...state.prefsByTier.banned
		];

		return activeEvent.tags.filter(tag => !usedTags.some(used => used.id === tag.id));
	}, [activeEvent, state.prefsByTier]);

	// --- 5. Handlers ---

	const updateTags = (e, newValues, reason, prefTier) => {
		// Create new state object
		const newPrefsByTier = { ...state.prefsByTier };
		newPrefsByTier[prefTier] = newValues;

		dispatch({
			type: "UPDATE_PREFERENCES",
			payload: { prefsByTier: newPrefsByTier }
		});
	};

	const handleTagLookup = (e, newValue) => {
		if (newValue) {
			handleModalClick(newValue.name);
		}
	};

	const handleModalClick = (tagName) => {
		setModalOpenState(prev => ({ ...prev, ["open" + tagName]: true }));
	};

	const handleClose = (tagName) => {
		setModalOpenState(prev => ({ ...prev, ["open" + tagName]: false }));
	};

	// --- 6. Render Helpers ---

	const renderTagModals = () => {
		// Guard clause
		if (!activeEvent || !activeEvent.tags) return null;

		return activeEvent.tags.map(tag => (
			<InfoModal
				key={tag.name} // Add key
				openModelFlag={modalOpenState["open" + tag.name] || false}
				tag={tag}
				handleClose={() => handleClose(tag.name)}
			/>
		));
	};

	// --- 7. Loading State ---
	if (!activeEvent) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
				<CircularProgress />
			</Box>
		);
	}

	// Helper to get options for a specific tier (usable + current)
	const getOptionsForTier = (currentValues) => {
		// Combine usable tags with the current values for this tier
		// This ensures selected values are always in the options list
		return [...usableTags, ...currentValues].sort((a, b) => {
			if (a.required && !b.required) return -1;
			if (!a.required && b.required) return 1;
			return a.name.localeCompare(b.name);
		});
	};

	// --- 8. Main Render ---
	return (
		<div className="preferencesPage">
			{renderTagModals()}

			<div className="container-fluid" style={{ maxWidth: 970 + 'px' }}>
				<h1><strong>RANK YOUR DRAWING PREFERENCES</strong></h1>
			</div>
			<div className="container-fluid" style={{ maxWidth: 970 + 'px' }}>
				<p align="center">
					Please fill in your drawing preferences from the options below. You MUST include at least ONE required tag for your prefer or willing to draw fields. Filling in more tags may result in better matchups.
				</p>
				<div style={{ marginTop: 1 + '%', marginBottom: 30, paddingTop: 0 }}>
					<div className="row justify-content-center">
						<div style={{ width: '25%' }}>
							<AutocompleteInput
								title="Search Tags for Info"
								tags={activeEvent.tags || []}
								autocomplPropPassThru={{
									multiple: false,
									value: null,
									blurOnSelect: true,
									sx: { backgroundColor: '#bbe3ffff' }
								}}
								updateTags={handleTagLookup}
							/>
						</div>
					</div>
				</div>
			</div>

			<div className="container-fluid" style={{ maxWidth: 970 + 'px' }}>
				<form className="container-fluid">
					<div className="row justify-content-center">
						<AutocompleteInput
							title="Prefer Drawing"
							tags={getOptionsForTier(state.prefsByTier.prefer)}
							autocomplPropPassThru={{
								sx: { backgroundColor: '#CCFFCC' },
								value: state.prefsByTier.prefer
							}}
							chipPropPassThru={{ color: 'primary' }}
							updateTags={(e, values, r) => updateTags(e, values, r, "prefer")}
						/>
					</div>
					<div className="row justify-content-center"
						style={{ marginTop: 1.2 + '%', marginBottom: 1.2 + '%' }}>
						<AutocompleteInput
							title="Willing to Draw"
							tags={getOptionsForTier(state.prefsByTier.willing)}
							autocomplPropPassThru={{
								value: state.prefsByTier.willing
							}}
							updateTags={(e, values, r) => updateTags(e, values, r, "willing")}
						/>
					</div>
					<div className="row justify-content-center">
						<AutocompleteInput
							title="Will not Draw"
							tags={getOptionsForTier(state.prefsByTier.banned)}
							autocomplPropPassThru={{
								sx: { backgroundColor: '#FFCCCC' },
								value: state.prefsByTier.banned
							}}
							chipPropPassThru={{ color: 'error' }}
							updateTags={(e, values, r) => updateTags(e, values, r, "banned")}
						/>
					</div>
				</form>
			</div>
		</div>
	);
};

export default Preferences;
