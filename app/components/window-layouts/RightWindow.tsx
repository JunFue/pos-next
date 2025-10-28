interface RightWindowProps {
  rightWidth: string;
}

const RightWindow = ({ rightWidth }: RightWindowProps) => {
  return (
    <div
      className="h-screen overflow-hidden transition-all duration-500 ease-in-out shrink-0"
      style={{ width: rightWidth }}
    >
      <div className="box-border pt-8 pr-8 pb-8 pl-4 w-full h-full">
        <div className="bg-primary-dark w-full h-full"></div>
      </div>
    </div>
  );
};

export default RightWindow;
