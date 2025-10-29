import FormFields from "./components/FormFields";

const SalesTerminal = () => {
  return (
    <div className="flex flex-col p-1 border-2 border-white h-full">
      {/* Terminal Header */}
      <div className="flex flex-col items-center">
        <h1 className="text-text-primary">POINT OF SALE</h1>
        <h2 className="text-text-primary">Welcome User!</h2>
      </div>
      <div className="gap-1 grid grid-cols-2 grid-rows-2 grow">
        {/* Terminal Input Fields */}

        <FormFields />
        {/* Terminal Cart */}
        <div className="flex justify-center items-center row-span-2 border-2 border-amber-100 text-white text-5xl">
          TERMINAL CART
        </div>
        {/* Terminal Button */}
        <div className="border border-amber-100">
          <button className="btn-keyboard">Press Me</button>
        </div>
      </div>
    </div>
  );
};

export default SalesTerminal;
