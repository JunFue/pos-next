interface RightWindowProps {
  rightWidth: string;
}

const RightWindow = ({ rightWidth }: RightWindowProps) => {
  return (
    <div
      className="h-screen overflow-hidden transition-all duration-500 ease-in-out shrink-0"
      style={{ width: rightWidth }}
    >
      <div className="box-border p-8 w-full h-full">
        <div className="bg-primary-dark w-full h-full"></div>
      </div>
    </div>
  );
};

export default RightWindow;
