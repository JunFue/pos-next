const SalesTerminal = () => {
  return (
    <div className="flex flex-col border-2 border-white h-full">
      {/* Terminal Header */}
      <div className="flex flex-col items-center">
        <h1 className="text-text-primary">POINT OF SALE</h1>
        <h2 className="text-text-primary">Welcome User!</h2>
      </div>
      <div className="grid grid-cols-2 grid-rows-2 border-2 border-red-500 grow">
        {/* Terminal Input Fields */}
        <div className="gap-0 grid grid-cols-6 grid-rows-4 w-full text-white">
          <div className="border border-white h-full">Hello</div>
          <div className="border border-white h-full">Hello</div>
          <div className="border border-white h-full">Hello</div>
          <div className="border border-white h-full">Hello</div>
          <div className="border border-white h-full">Hello</div>
          <div className="border border-white h-full">Hello</div>
          <div className="border border-white h-full">Hello</div>
          <div className="border border-white h-full">Hello</div>
          <div className="border border-white h-full">Hello</div>
          <div className="border border-white h-full">Hello</div>
          <div className="border border-white h-full">Hello</div>
          <div className="border border-white h-full">Hello</div>
          <div className="border border-white h-full">Hello</div>
          <div className="border border-white h-full">Hello</div>
          <div className="border border-white h-full">Hello</div>
          <div className="border border-white h-full">Hello</div>
          <div className="border border-white h-full">Hello</div>
          <div className="border border-white h-full">Hello</div>
          <div className="border border-white h-full">Hello</div>
          <div className="border border-white h-full">Hello</div>
          <div className="border border-white h-full">Hello</div>
          <div className="border border-white h-full">Hello</div>
          <div className="border border-white h-full">Hello</div>
          <div className="border border-white h-full">Hello</div>
        </div>
        {/* Terminal Cart */}
        <div className="flex justify-center items-center row-span-2 border-2 border-amber-100 text-white text-5xl">
          TERMINAL CART
        </div>
        {/* Terminal Button */}
        <div>
          <button className="btn-3d-glass">Press Me</button>
        </div>
      </div>
    </div>
  );
};

export default SalesTerminal;
