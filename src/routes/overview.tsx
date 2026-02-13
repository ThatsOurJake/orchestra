import { useCallback } from 'react';
import { useNavigate } from 'react-router';

export const Overview = () => {
  const navigate = useNavigate();

  const onNewTicket = useCallback(() => {
    navigate('/create');
  }, [navigate]);

  return (
    <div className="flex justify-center items-center grow shrink flex-col">
      <p className="text-4xl">Welcome</p>
      <p className="text-xl mt-6">Description description description</p>
      <button
        className="w-1/3 py-2 bg-orange-500 hover:bg-orange-400 rounded-md border cursor-pointer mt-12"
        onClick={onNewTicket}
        type="button"
      >
        Create a ticket
      </button>
    </div>
  );
};
