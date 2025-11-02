import Navigation from "./components/navigation/Navigation";

// This is the content for the RIGHT window when at /dashboard
export default function DashboardHomePage() {
  return (
    <div className="p-6 text-white">
      <h1 className="mb-4 font-bold text-2xl">Home Page</h1>
      {/* HEADER BORDER */}
      <div className="mb-5 border border-slate-700"></div>

      {/* This is the icon grid from your mockup */}
      <Navigation />

      {/* 3. Example Stats Cards */}
      <div className="gap-6 grid grid-cols-1 md:grid-cols-2 mt-8">
        {/* --- LEFT COLUMN --- */}
        <div className="flex flex-col gap-6">
          {/* Total Customers Card */}
          <div className="p-6 glass-effect">
            <h3 className="font-medium text-slate-400 text-sm">
              Total Customers
            </h3>
            <p className="mt-2 font-bold text-white text-4xl">10,238</p>
            {/* Using text-green-400 as a proxy for the accent color in the mockup */}
            <p className="mt-1 text-green-400 text-sm">Textnotrunter</p>
          </div>

          {/* Daily Sales Card */}
          <div className="p-6 glass-effect">
            <h3 className="font-medium text-slate-400 text-sm">Daily Sales</h3>
            <p className="mt-2 font-bold text-white text-4xl">$73,495</p>
            <p className="mt-1 text-slate-400 text-sm">Testna or 1 went</p>
          </div>
        </div>

        {/* --- RIGHT COLUMN --- */}
        <div className="flex flex-col gap-6">
          {/* JunFue Chat Card */}
          {/* flex-1 makes this card take up available space, pushing the button down */}
          <div className="flex-1 p-6 glass-effect">
            <h3 className="font-medium text-slate-400 text-sm">JunFue Chat</h3>
            <ul className="space-y-2 mt-4 text-slate-300 list-disc list-inside">
              <li>Soumstandly,</li>
              {/* Using the .right-trim class from your globals.css */}
              <li className="right-trim">Borkimabdecrsons of guur</li>
              <li className="right-trim">Expiaration with over cost of</li>
            </ul>
          </div>

          {/* See More Button */}
          <button className="hover:bg-white/10 p-4 w-full font-semibold text-white text-lg transition-colors glass-effect">
            See More...
          </button>
        </div>
      </div>
    </div>
  );
}
