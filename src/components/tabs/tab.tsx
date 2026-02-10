export interface TabProps {
  title: string;
  isSelected?: boolean;
  onClick?: () => void;
}

export const Tab = ({ title, isSelected, onClick }: TabProps) => {
  return (
    <button
      className={`${isSelected ? 'bg-orange-500' : 'bg-orange-300'} px-4 py-2 cursor-pointer rounded-t hover:underline`}
      onClick={onClick}
      type="button"
    >
      <p>{title}</p>
    </button>
  );
};
