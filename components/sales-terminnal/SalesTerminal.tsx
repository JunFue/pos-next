// app/inventory/components/stock-management/SalesTerminal.tsx
import { useMediaQuery } from "@/app/hooks/useMediaQuery";
import { useView } from "../window-layouts/ViewContext";
import FormFields from "./components/FormFields";
import TerminalButtons from "./components/buttons/TerminalButtons";
import { useState, useEffect } from "react";
import { useForm, FormProvider, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  posSchema,
  PosFormValues,
  getDefaultFormValues,
} from "./utils/posSchema";
import { SignIn } from "../sign-in/SignIn";
import { SignUp } from "../sign-in/SignUp";
import { X } from "lucide-react";
import { handleLogOut } from "./components/buttons/handlers";
import { supabase } from "@/lib/supabaseClient";

type AuthModalState = "hidden" | "signIn" | "signUp";

const SalesTerminal = () => {
  const { isSplit } = useView();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [authModalState, setAuthModalState] =
    useState<AuthModalState>("hidden");

  // --- react-hook-form initialization ---
  const methods = useForm<PosFormValues>({
    resolver: zodResolver(posSchema),
    defaultValues: getDefaultFormValues(),
  });

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // --- useEffect for auth state ---
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setIsLoggedIn(!!session);
      }
    );
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // --- modal handlers ---
  const openSignInModal = () => setAuthModalState("signIn");
  const openSignUpModal = () => setAuthModalState("signUp");
  const closeModal = () => setAuthModalState("hidden");
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    closeModal();
  };
  const handleLogoutClick = async () => {
    const loggedOut = await handleLogOut();
    if (loggedOut) {
      setIsLoggedIn(false);
    } else {
      console.error("Failed to log out.");
    }
  };

  // --- layout logic ---
  function ScreenLogic() {
    if (isSplit && !isMobile) {
      return "grid-rows-2";
    } else if (!isSplit && !isMobile) {
      return "grid-cols-2";
    }
    return ""; // fallback
  }

  // --- submit handler ---
  const onDoneSubmit: SubmitHandler<PosFormValues> = (data) => {
    console.log("Form Data:", data);
    // Reset if needed:
    // methods.reset(getDefaultFormValues());
  };

  return (
    <div className="flex flex-col p-1 h-full">
      {/* Terminal Header */}
      <div className="flex flex-col items-center">
        <h1 className="text-text-primary sm:text-1xl md:text-3xl lg:text-4xl">
          POINT OF SALE
        </h1>
        <h2 className="text-text-primary">
          {isLoggedIn ? "Welcome User!" : "Please Sign In"}
        </h2>
      </div>

      {/* FormProvider + form */}
      <FormProvider {...methods}>
        <form
          id="sales-form"
          onSubmit={methods.handleSubmit(onDoneSubmit)}
          className={`gap-1 grid ${ScreenLogic()} w-full h-full overflow-hidden`}
        >
          <div className="relative flex flex-col w-full h-full">
            <FormFields />
            <TerminalButtons
              isLoggedIn={isLoggedIn}
              onSignInClick={openSignInModal}
              onLogoutClick={handleLogoutClick}
            />
          </div>
          <div className="flex justify-center items-center border border-primary-light rounded-2xl overflow-hidden text-white text-5xl">
            TERMINAL CART
          </div>
        </form>
      </FormProvider>

      {/* Auth Modal */}
      {authModalState !== "hidden" && (
        <div
          className="z-40 fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={closeModal}
              className="top-4 right-4 z-50 absolute p-2 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            {authModalState === "signIn" ? (
              <SignIn
                onSwitchToSignUp={openSignUpModal}
                onSuccess={handleLoginSuccess}
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
