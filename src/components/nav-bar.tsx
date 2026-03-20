import { useRegisterSW } from 'virtual:pwa-register/react';
import {
  mdiChatOutline,
  mdiFaceAgent,
  mdiFile,
  mdiMenuClose,
  mdiMenuOpen,
  mdiRefresh,
  mdiSitemapOutline,
} from '@mdi/js';
import Icon from '@mdi/react';
import { useCallback, useState } from 'react';
import { Link } from 'react-router';

export const NavBar = () => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const toggleSidebar = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  return (
    <nav
      className={`${isOpen ? 'w-60' : 'w-12'} shrink-0 bg-gray-800 h-full p-1 overflow-hidden transition-all drop-shadow-xl`}
    >
      <div className={`flex flex-col ${isOpen ? 'flex' : 'hidden'} h-full `}>
        <div className="flex justify-between items-center w-full p-2">
          <Link to="/">
            <p className="whitespace-nowrap">Orchestra</p>
          </Link>
          <button onClick={toggleSidebar} type="button">
            <Icon
              path={mdiMenuOpen}
              size={1}
              color="#ffffff"
              className="cursor-pointer"
            />
          </button>
        </div>
        <div className="h-px mt-1 bg-orange-300" />
        <div className="flex mt-2">
          <Link
            to="/agents"
            className="flex gap-x-1 justify-between items-center cursor-pointer hover:bg-gray-600 rounded-sm w-full p-2"
          >
            <p className="whitespace-nowrap">Agents</p>
            <Icon path={mdiFaceAgent} size={1} color="#ffffff" />
          </Link>
        </div>
        <div className="flex mt-2">
          <Link
            to="/flows"
            className="flex gap-x-1 justify-between items-center cursor-pointer hover:bg-gray-600 rounded-sm w-full p-2"
          >
            <p className="whitespace-nowrap">Flows</p>
            <Icon path={mdiSitemapOutline} size={1} color="#ffffff" />
          </Link>
        </div>
        <div className="flex mt-2">
          <Link
            to="/chat"
            className="flex gap-x-1 justify-between items-center cursor-pointer hover:bg-gray-600 rounded-sm w-full p-2"
          >
            <p className="whitespace-nowrap">Chat</p>
            <Icon path={mdiChatOutline} size={1} color="#ffffff" />
          </Link>
        </div>
        <div className="flex mt-2">
          <Link
            to="/docs"
            className="flex gap-x-1 justify-between items-center cursor-pointer hover:bg-gray-600 rounded-sm w-full p-2"
          >
            <p className="whitespace-nowrap">Docs</p>
            <Icon path={mdiFile} size={1} color="#ffffff" />
          </Link>
        </div>
        <div className="mt-auto">
          {needRefresh && (
            <>
              <div className="h-px bg-orange-300 mb-2" />
              <button
                type="button"
                onClick={() => updateServiceWorker(true)}
                className="flex gap-x-1 justify-between items-center cursor-pointer hover:bg-gray-600 rounded-sm w-full p-2 text-orange-300"
              >
                <p className="whitespace-nowrap text-sm">Update available</p>
                <Icon path={mdiRefresh} size={1} color="currentColor" />
              </button>
            </>
          )}
          {__COMMIT_SHA__ && (
            <p className="text-xs text-gray-500 p-2 whitespace-nowrap text-center">
              Release: {__COMMIT_SHA__.slice(0, 7)}
            </p>
          )}
        </div>
      </div>
      <div className={`flex flex-col ${isOpen ? 'hidden' : 'block'}`}>
        <button
          className="cursor-pointer p-2"
          onClick={toggleSidebar}
          title="Open sidebar"
          type="button"
        >
          <Icon
            path={mdiMenuClose}
            size={1}
            color="#ffffff"
            className="cursor-pointer"
          />
        </button>
        <div className="h-px mt-1 bg-orange-300" />
        <Link className="cursor-pointer p-2 mt-2" to="/agents" title="Agents">
          <Icon path={mdiFaceAgent} size={1} color="#ffffff" />
        </Link>
        <Link
          className="inline-block cursor-pointer p-2 mt-2"
          to="/flows"
          title="Flows"
        >
          <Icon path={mdiSitemapOutline} size={1} color="#ffffff" />
        </Link>
        <Link className="cursor-pointer p-2 mt-2" to="/chat" title="Chat">
          <Icon path={mdiChatOutline} size={1} color="#ffffff" />
        </Link>
        <Link className="cursor-pointer p-2 mt-2" to="/docs" title="Docs">
          <Icon path={mdiFile} size={1} color="#ffffff" />
        </Link>
        {needRefresh && (
          <button
            type="button"
            onClick={() => updateServiceWorker(true)}
            title="Update available"
            className="cursor-pointer p-2 mt-auto text-orange-300 hover:bg-gray-600 rounded-sm"
          >
            <Icon path={mdiRefresh} size={1} color="currentColor" />
          </button>
        )}
      </div>
    </nav>
  );
};
