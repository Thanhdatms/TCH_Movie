import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "../store/authUser";
import { Camera } from "lucide-react";
import AvatarSelectionModal from "./AvatarSelectionModal";

const AvatarDropdown = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user } = useAuthStore();

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAvatarClick = () => {
    setIsOpen(!isOpen);
  };

  const handleAvatarSelect = (newAvatarUrl) => {
    // The user object will be updated through the API call in the modal
    window.location.reload(); // Refresh to show the new avatar
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <img
        src={user.image}
        alt="Avatar"
        className="h-8 rounded cursor-pointer hover:opacity-80 transition-opacity"
        onClick={handleAvatarClick}
      />
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-black border border-gray-700 z-50">
          <div className="py-1">
            <button
              onClick={() => {
                setIsModalOpen(true);
                setIsOpen(false);
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
            >
              <Camera className="mr-2 h-4 w-4" />
              Change Avatar
            </button>
            <button
              onClick={onLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
            >
              Logout
            </button>
          </div>
        </div>
      )}

      <AvatarSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAvatarSelect={handleAvatarSelect}
      />
    </div>
  );
};

export default AvatarDropdown;
