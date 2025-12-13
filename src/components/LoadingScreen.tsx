// src/components/LoadingScreen.tsx
import Galaxy from "./Galaxy";
import logo from "../assets/logo.png";

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 -z-10">
        <Galaxy transparent={false} saturation={0} />
      </div>
      <div className="text-center">
        <img 
          src={logo} 
          alt="Loading..." 
          className="w-48 h-48 mx-auto rounded-3xl animate-pulse" 
        />
        <p className="text-white text-2xl mt-8 font-medium">Loading...</p>
      </div>
    </div>
  );
}