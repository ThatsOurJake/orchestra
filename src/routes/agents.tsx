import { CreateAgent } from '../components/tab-screens/create-agent';
import { ViewAgents } from '../components/tab-screens/view-agents';
import { Tab } from '../components/tabs/tab';
import { TabBar } from '../components/tabs/tab-bar';
import { TabContent } from '../components/tabs/tab-content';
import { TabScreen } from '../components/tabs/tab-screen';
import { TabsWrapper } from '../components/tabs/wrapper';

export const Agents = () => {
  return (
    <TabsWrapper>
      <TabBar>
        <Tab title="View Agents" />
        <Tab title="Create Agent" />
      </TabBar>
      <TabContent>
        <TabScreen component={ViewAgents} />
        <TabScreen component={CreateAgent} />
      </TabContent>
    </TabsWrapper>
  );
};
