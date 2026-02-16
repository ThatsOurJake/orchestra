import { BrowserRouter, Route, Routes } from 'react-router';
import { ToastContainer } from 'react-toastify';
import { FileImportModal } from './components/file-import-modal';
import { InputModal } from './components/input-modal';
import { NavBar } from './components/nav-bar';
import { Agents } from './routes/agents';
import { Create } from './routes/chat';
import { Flows } from './routes/flows';
import { Overview } from './routes/overview';

const App = () => {
  return (
    <div className="bg-gray-900 h-screen w-screen text-white flex">
      <BrowserRouter>
        <main className="w-full h-full flex flex-row">
          <NavBar />
          <Routes>
            <Route path="/" Component={Overview} />
            <Route path="/chat" Component={Create} />
            <Route path="/agents" Component={Agents} />
            <Route path="/flows" Component={Flows} />
          </Routes>
        </main>
      </BrowserRouter>
      <ToastContainer
        position="top-right"
        theme="light"
        pauseOnFocusLoss={false}
        pauseOnHover={false}
      />
      <InputModal />
      <FileImportModal />
    </div>
  );
};

export default App;
