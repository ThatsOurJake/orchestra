import { createBrowserRouter, Outlet, RouterProvider } from 'react-router';
import { ToastContainer } from 'react-toastify';
import { FileImportModal } from './components/file-import-modal';
import { InputModal } from './components/input-modal';
import { NavBar } from './components/nav-bar';
import { ReviewModal } from './components/review-modal';
import { Agents } from './routes/agents';
import { Create } from './routes/chat';
import { Docs } from './routes/docs';
import { Flows } from './routes/flows';
import { Overview } from './routes/overview';

const Layout = () => (
  <div className="bg-gray-900 h-screen w-screen text-white flex">
    <main className="w-full h-full flex flex-row">
      <NavBar />
      <Outlet />
    </main>
    <ToastContainer
      position="top-right"
      theme="light"
      pauseOnFocusLoss={false}
      pauseOnHover={false}
    />
    <InputModal />
    <ReviewModal />
    <FileImportModal />
  </div>
);

const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      {
        index: true,
        Component: Overview,
      },
      {
        path: 'chat',
        Component: Create,
      },
      {
        path: 'agents',
        Component: Agents,
      },
      {
        path: 'flows',
        Component: Flows,
      },
      {
        path: 'docs',
        Component: Docs,
      },
      {
        path: 'docs/:slug',
        Component: Docs,
      },
    ],
  },
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
