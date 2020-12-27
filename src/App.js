// import logo from './logo.svg';
import './App.css';
import BuoyPage from './components/BuoyPage'
import { WAIMEA_BAY, BARBERS_POINT, KANEOHE_BAY, PEARL_HARBOR } from './constants/NoaaBuoys';

function App() {
  return (
    <div className="App container mx-auto px-4 py-4">
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
      <BuoyPage
        buoyId={BARBERS_POINT.id}
        title={BARBERS_POINT.name}
      />
      <BuoyPage
        buoyId={WAIMEA_BAY.id}
        title={WAIMEA_BAY.name}
      />
      <BuoyPage
        buoyId={KANEOHE_BAY.id}
        title={KANEOHE_BAY.name}
      />
      <BuoyPage
        buoyId={PEARL_HARBOR.id}
        title={PEARL_HARBOR.name}
      />
    </div>
  );
}

export default App;