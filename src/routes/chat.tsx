import { useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { ChatHistoryScreen } from '../components/tab-screens/chat-history';
import { CreationWindow } from '../components/tab-screens/chat-window';
import { Tab } from '../components/tabs/tab';
import { TabBar } from '../components/tabs/tab-bar';
import { TabContent } from '../components/tabs/tab-content';
import { TabScreen } from '../components/tabs/tab-screen';
import { TabsWrapper } from '../components/tabs/wrapper';

export const Create = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const flowId = searchParams.get('flowId');

  useEffect(() => {
    if (flowId) {
      setSearchParams({});
    }
  }, [flowId, setSearchParams]);

  return (
    <TabsWrapper>
      <TabBar>
        <Tab title="Chat Window" />
        <Tab title="History" />
      </TabBar>
      <TabContent>
        <TabScreen
          component={CreationWindow}
          componentProps={{ autoLoadFlowId: flowId }}
        />
        <TabScreen component={ChatHistoryScreen} />
      </TabContent>
    </TabsWrapper>
  );
};
