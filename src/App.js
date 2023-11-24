import {React} from "react";
import {createStore, applyMiddleware} from "redux";
import {Provider} from "react-redux";
import thunk from "redux-thunk";
import "./css/App.css";
import {Route, Routes, BrowserRouter as Router} from "react-router-dom";
import {formState} from "./state/formState";

import Home from "./pages/SignUps/home";
import {Preferences} from "./pages/SignUps/preferences";
import {Subjects} from "./pages/SignUps/subjects";
import {Tier} from "./pages/SignUps/tier";
import {Backup} from "./pages/SignUps/backup";
import {Info} from "./pages/SignUps/info";
import {Finish} from "./pages/SignUps/finish";
// import Submissions from "./pages/Submissions/submissions";
// import {Submission} from "./pages/Submissions/submissionForm";
import Temp from "./pages/Submissions/temp";
import Gallery from "./pages/Gallery/gallery";
import Gallery2022 from "./pages/Gallery/gallery2022";

const store = createStore(formState, applyMiddleware(thunk));

function App() {
	return (
			<Provider store={store}>
				<Router>
					<div className="App">
						<Routes>
							<Route path="/" element={<Home/>}/>
							<Route path="/preferences" element={<Preferences/>}/>
							<Route path="/subjects" element={<Subjects/>}/>
							<Route path="/tier" element={<Tier/>}/>
							<Route path="/backup" element={<Backup/>}/>
							<Route path="/info" element={<Info/>}/>
							<Route path="/finish" element={<Finish/>}/>
							<Route path="/submit" element={<Temp/>}/>
							{/*<Route path="/submissionForm" element={<Submission/>}/>*/}
							<Route path="/gallery" element={<Gallery/>}/>
							<Route path="/gallery/2022" element={<Gallery2022/>}/>
						</Routes>
					</div>
				</Router>
			</Provider>
	);
}

export default App;
