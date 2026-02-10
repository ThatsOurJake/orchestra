import { CreationWindow } from '../components/tab-screens/chat-window';
import { Settings } from '../components/tab-screens/settings';
import { Tab } from '../components/tabs/tab';
import { TabBar } from '../components/tabs/tab-bar';
import { TabContent } from '../components/tabs/tab-content';
import { TabScreen } from '../components/tabs/tab-screen';
import { TabsWrapper } from '../components/tabs/wrapper';

export const Create = () => {
  return (
    <TabsWrapper>
      <TabBar>
        <Tab title="Chat Window" />
        <Tab title="Settings" />
      </TabBar>
      <TabContent>
        <TabScreen component={CreationWindow} />
        <TabScreen component={Settings} />
      </TabContent>
    </TabsWrapper>
  );
};
