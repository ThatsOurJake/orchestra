import { useStore } from '../store';

export const SavedFlows = () => {
  const { storedFlows } = useStore();

  return (
    <div>
      {storedFlows.map((x) => (
        <p key={x.id}>{x.name}</p>
      ))}
    </div>
  );
};
