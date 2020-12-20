// import logo from './logo.svg';
import './App.css';
import BuoyPage from './components/BuoyPage'

function App() {
  const barbersPointBuoyId = 51212;
  const waimeaBayBuoyId = 51201;

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
        buoyId={barbersPointBuoyId}
        title='Barbers Point'
      />
      <BuoyPage
        buoyId={waimeaBayBuoyId}
        title='Waimea Bay'
      />
    </div>
  );
}

export default App;
