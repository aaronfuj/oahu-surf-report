// import logo from './logo.svg';
import "./App.css";
import OahuPage from "./components/OahuPage";

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
      <OahuPage />
    </div>
  );
}

export default App;
