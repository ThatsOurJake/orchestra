import {
  mdiFaceAgent,
  mdiMenuClose,
  mdiMenuOpen,
  mdiPlusBox,
  mdiSitemapOutline,
} from '@mdi/js';
import Icon from '@mdi/react';
import { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router';

export const NavBar = () => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const navigate = useNavigate();

  const toggleSidebar = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  const onNewTicket = useCallback(() => {
    navigate('/chat');
  }, [navigate]);

  const onAgentClick = useCallback(() => {
    navigate('/agents');
  }, [navigate]);

  const onFlowClick = useCallback(() => {
    navigate('/flows');
  }, [navigate]);

  return (
    <nav
      className={`${isOpen ? 'w-60' : 'w-12'} shrink-0 bg-gray-800 h-full p-1 overflow-hidden transition-all drop-shadow-xl`}
    >
      <div className={`flex flex-col ${isOpen ? 'block' : 'hidden'} h-full `}>
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
          <button
            className="flex gap-x-1 justify-between items-center cursor-pointer hover:bg-gray-600 rounded-sm w-full p-2"
            onClick={onAgentClick}
            type="button"
          >
            <p className="whitespace-nowrap">Agents</p>
            <Icon path={mdiFaceAgent} size={1} color="#ffffff" />
          </button>
        </div>
        <div className="flex mt-2">
          <button
            className="flex gap-x-1 justify-between items-center cursor-pointer hover:bg-gray-600 rounded-sm w-full p-2"
            onClick={onFlowClick}
            type="button"
          >
            <p className="whitespace-nowrap">Flows</p>
            <Icon path={mdiSitemapOutline} size={1} color="#ffffff" />
          </button>
        </div>
        <div className="flex mt-2">
          <button
            className="flex gap-x-1 justify-between items-center cursor-pointer hover:bg-gray-600 rounded-sm w-full p-2"
            onClick={onNewTicket}
            type="button"
          >
            <p className="whitespace-nowrap">New Chat</p>
            <Icon path={mdiPlusBox} size={1} color="#ffffff" />
          </button>
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
        <button
          className="cursor-pointer p-2 mt-2"
          onClick={onAgentClick}
          title="Agents"
          type="button"
        >
          <Icon path={mdiFaceAgent} size={1} color="#ffffff" />
        </button>
        <button
          className="cursor-pointer p-2 mt-2"
          onClick={onFlowClick}
          title="Flows"
          type="button"
        >
          <Icon path={mdiSitemapOutline} size={1} color="#ffffff" />
        </button>
        <button
          className="cursor-pointer p-2 mt-2"
          onClick={onNewTicket}
          title="New Chat"
          type="button"
        >
          <Icon path={mdiPlusBox} size={1} color="#ffffff" />
        </button>
      </div>
    </nav>
  );
};
