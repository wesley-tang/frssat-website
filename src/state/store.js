import { configureStore } from '@reduxjs/toolkit';
import { formState } from './formState';

// configureStore replaces createStore
// It automatically sets up Redux Thunk and the Redux DevTools Extension
export const store = configureStore({
	reducer: {
		// If you had combineReducers, you can put them all here:
		// reducer: {
		//   formState: formState,
		//   anotherState: anotherReducer,
		// }
		formState: formState,
	},
});