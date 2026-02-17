import { CreateFlow } from '../components/tab-screens/create-flow';
import { LangPlayground } from '../components/tab-screens/lang-playground';
import { SavedFlows } from '../components/tab-screens/saved-flows';
import { Tab } from '../components/tabs/tab';
import { TabBar } from '../components/tabs/tab-bar';
import { TabContent } from '../components/tabs/tab-content';
import { TabScreen } from '../components/tabs/tab-screen';
import { TabsWrapper } from '../components/tabs/wrapper';

export const Flows = () => {
  return (
    <TabsWrapper>
      <TabBar>
        <Tab title="Saved Flows" />
        <Tab title="Create Flow" />
        <Tab title="Lang Playground" />
      </TabBar>
      <TabContent>
        <TabScreen component={SavedFlows} />
        <TabScreen component={CreateFlow} />
        <TabScreen component={LangPlayground} />
      </TabContent>
    </TabsWrapper>
  );
};
