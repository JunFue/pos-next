import { useMediaQuery } from "@/app/hooks/useMediaQuery";
import { useView } from "../window-layouts/ViewContext";
import FormFields from "./components/FormFields";
import TerminalButtons from "./components/buttons/TerminalButtons";
import { useState } from "react";
import { SignIn } from "../sign-in/SignIn";
import { SignUp } from "../sign-in/SignUp"; // 1. Import the new SignUp component
import { X } from "lucide-react";

// 2. Define the states for our modal
type AuthModalState = "hidden" | "signIn" | "signUp";

const SalesTerminal = () => {
  const { isSplit } = useView();
  const isMobile = useMediaQuery("(max-width: 768px)");

  // 3. Change state from boolean to our new type
  const [authModalState, setAuthModalState] =
    useState<AuthModalState>("hidden");

  // 4. Update modal control functions
  const openSignInModal = () => setAuthModalState("signIn");
  const openSignUpModal = () => setAuthModalState("signUp");
  const closeModal = () => setAuthModalState("hidden");

  function ScreenLogic() {
    if (isSplit && !isMobile) {
      return "grid-rows-2";
    } else if (!isSplit && !isMobile) {
      return "grid-cols-2";
    }
  }

  return (
    <div className="flex flex-col p-1 h-full">
      {/* Terminal Header */}
      <div className="flex flex-col items-center">
        <h1 className="text-text-primary sm:text-1xl md:text-3xl lg:text-4xl">
          POINT OF SALE
        </h1>
        <h2 className="text-text-primary">Welcome User!</h2>
      </div>
      <div
        className={`gap-1 grid  ${ScreenLogic()}  w-ful h-full overflow-hidden`}
      >
        <div className="relative flex flex-col w-full h-full">
          {" "}
          <FormFields />
          <TerminalButtons onSignInClick={openSignInModal} />
          <div></div>
        </div>

        <div className="flex justify-center items-center border border-primary-light rounded-2xl overflow-hidden text-white text-5xl">
          TERMINAL CART
        </div>
      </div>

      {/* 5. Update modal visibility check */}
      {authModalState !== "hidden" && (
        <div
          // Backdrop
          className="z-40 fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm"
          onClick={closeModal} // Close modal on backdrop click
        >
          <div
            // Modal Content wrapper
            className="relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="top-4 right-4 z-50 absolute p-2 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* 6. Conditionally render the correct component */}
            {authModalState === "signIn" ? (
              <SignIn
                onSwitchToSignUp={openSignUpModal}
                onSuccess={closeModal}
              />
            ) : (
              <SignUp onSwitchToSignIn={openSignInModal} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesTerminal;
