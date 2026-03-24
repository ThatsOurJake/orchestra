import { useMemo } from 'react';
import { Link } from 'react-router';
import { useStore } from '../components/store';

export const Overview = () => {
  const agents = useStore((state) => state.agents);
  const storedFlows = useStore((state) => state.storedFlows);

  const recentFlows = useMemo(() => {
    return storedFlows
      .slice()
      .sort((a, b) => {
        const aTime = a.lastEditedAt || a.createdAt;
        const bTime = b.lastEditedAt || b.createdAt;
        return bTime - aTime;
      })
      .slice(0, 5);
  }, [storedFlows]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="overflow-y-auto w-full">
      <div className="flex flex-col p-8 max-w-6xl mx-auto w-full text-black">
        {/* Greeting Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-white">Orchestra</h1>
          <p className="text-xl text-white">
            {getGreeting()}! Ready to orchestrate your agents?
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-100 border border-blue-300 rounded-lg p-6">
            <p className="text-3xl font-bold text-blue-700">{agents.length}</p>
            <p className="text-sm text-blue-600 mt-1">Agents</p>
          </div>
          <div className="bg-green-100 border border-green-300 rounded-lg p-6">
            <p className="text-3xl font-bold text-green-700">
              {storedFlows.length}
            </p>
            <p className="text-sm text-green-600 mt-1">Flows</p>
          </div>
          <div className="bg-purple-100 border border-purple-300 rounded-lg p-6">
            <p className="text-3xl font-bold text-purple-700">
              {recentFlows.length}
            </p>
            <p className="text-sm text-purple-600 mt-1">Recent Flows</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            to="/agents"
            className="bg-white border-2 border-blue-500 rounded-lg p-6 hover:bg-blue-50 transition-colors text-center"
          >
            <p className="text-lg font-semibold text-blue-700">View Agents</p>
            <p className="text-sm text-gray-600 mt-1">Manage your AI agents</p>
          </Link>
          <Link
            to="/flows"
            className="bg-white border-2 border-green-500 rounded-lg p-6 hover:bg-green-50 transition-colors text-center"
          >
            <p className="text-lg font-semibold text-green-700">View Flows</p>
            <p className="text-sm text-gray-600 mt-1">Browse and edit flows</p>
          </Link>
          <Link
            to="/chat"
            className="bg-white border-2 border-orange-500 rounded-lg p-6 hover:bg-orange-50 transition-colors text-center"
          >
            <p className="text-lg font-semibold text-orange-700">Chat</p>
            <p className="text-sm text-gray-600 mt-1">Start a new workflow</p>
          </Link>
        </div>

        {/* Recent Flows */}
        <div className="bg-white border border-gray-300 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Recent Flows</h2>
          {recentFlows.length === 0 ? (
            <p className="text-gray-500 italic">
              No flows yet. Create your first flow to get started!
            </p>
          ) : (
            <div className="space-y-3">
              {recentFlows.map((flow) => (
                <div
                  key={flow.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-lg">{flow.name}</p>
                      <p className="text-sm text-gray-500">
                        Last edited:{' '}
                        {new Date(
                          flow.lastEditedAt || flow.createdAt,
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <Link
                      to={`/chat?flowId=${flow.id}`}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
                    >
                      Run Flow
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
