import { ToastContainer } from 'react-toastify';
import { NavBar } from './components/nav-bar';
import { Router } from './components/router';
import { Route } from './components/router/route';
import { Agents } from './routes/agents';
import { Create } from './routes/create';
import { Flows } from './routes/flows';
import { Overview } from './routes/overview';

const App = () => {
  return (
    <div className="bg-gray-900 h-screen w-screen text-white flex">
      <Router>
        <NavBar />
        <main className="grow shrink flex flex-col">
          <Route path="/" component={Overview} />
          <Route path="/create" component={Create} />
          <Route path="/agents" component={Agents} />
          <Route path="/flows" component={Flows} />
        </main>
      </Router>
      <ToastContainer position="top-right" theme="light" />
    </div>
  );
};

export default App;
