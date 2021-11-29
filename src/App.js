import { React } from "react";
import { createStore, applyMiddleware } from "redux";
import { Provider } from "react-redux";
import thunk from "redux-thunk";
import "./App.css";
import { Route, Routes, BrowserRouter as Router } from "react-router-dom";
import { formState } from "./state/formState";

import Home from "./pages/home";
import { UserId } from "./pages/userid";
import { Preferences } from "./pages/preferences";
import { Subjects } from "./pages/subjects";
import { Tier } from "./pages/tier";
import { Backup } from "./pages/backup";
import { Info } from "./pages/info";
import { Finish } from "./pages/finish";

const store = createStore(formState, applyMiddleware(thunk));

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/userid" element={<UserId />} />
            <Route path="/preferences" element={<Preferences />} />
            <Route path="/subjects" element={<Subjects />} />
            <Route path="/tier" element={<Tier />} />
            <Route path="/backup" element={<Backup />} />
            <Route path="/info" element={<Info />} />
            <Route path="/finish" element={<Finish />} />
          </Routes>
        </div>
      </Router>
    </Provider>
  );
}

export default App;
