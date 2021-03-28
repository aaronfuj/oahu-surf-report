// import logo from './logo.svg';
import "./App.css";
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import OahuPage from "./components/OahuPage";
import SandysPage from "./components/SandysPage";
import MailiBeachPage from "./components/MailiBeachPage";

function App() {
  return (
    <div className="App container mx-auto max-w-screen-md px-4 py-4">
      {/* <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header> */}
      <BrowserRouter>
        <Switch>
          <Route path="/sandys">
            <SandysPage />
          </Route>
          <Route path="/maili">
            <MailiBeachPage />
          </Route>
          <Route path="/">
            <OahuPage />
          </Route>
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
