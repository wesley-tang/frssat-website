import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";

// 1. Import your new EventProvider
import { EventProvider } from "./context/EventContext";

// 2. Import your one, true store from store.js
import { store } from "./state/store";

import "./css/index.css";
import App from "./App"; // Import the simplified App.js

const container = document.getElementById("root");
const root = createRoot(container);

// This is the correct, final wrapper order.
// Redux is the "global" state.
// EventProvider provides event data to the whole app.
// BrowserRouter handles all routing.
root.render(
	<React.StrictMode>
		<Provider store={store}>
			<EventProvider>
				<BrowserRouter>
					<App />
				</BrowserRouter>
			</EventProvider>
		</Provider>
	</React.StrictMode>
);