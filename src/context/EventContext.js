import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { CircularProgress, Box, Typography } from '@mui/material'; // For a loading spinner

// 1. Create the context
export const EventContext = createContext(null);

/**
 * This is the "Provider" component. It will wrap your entire app.
 * Its job is to fetch the data *once* and provide it to all
 * its children.
 */
export function EventProvider({ children }) {
	const [activeEvent, setActiveEvent] = useState(null);
	const [config, setConfig] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// This runs one time when the app loads
		async function fetchEventData() {
			try {
				const response = await axios.get('/api/getActiveEvent');

				setActiveEvent(response.data.activeEvent);
				setConfig(response.data.globalConfig);

				setLoading(false);
			} catch (err) {
				console.error("Failed to load event data", err);
				// You could set an error state here
			}
		}
		fetchEventData();
	}, []);


	if (loading) {
		return (
			<Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
				<CircularProgress />
				<Typography variant="h6" sx={{ mt: 2 }}>
					Loading the FRSSAT app config...
				</Typography>
				<Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
					If you are stuck on this screen, please reach out to Hex.
				</Typography>
			</Box>
		);
	}

	return (
		<EventContext.Provider value={{ activeEvent, config }}>
			{children}
		</EventContext.Provider>
	);
}

export const useActiveEventContext = () => {
	return useContext(EventContext);
};