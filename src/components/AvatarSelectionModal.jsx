import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import axiosInstance from "../api/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authUser";

const AvatarSelectionModal = ({ isOpen, onClose, onAvatarSelect }) => {
  const [folders, setFolders] = useState([]);
  const [avatarsByFolder, setAvatarsByFolder] = useState({});
  const [loadingFolders, setLoadingFolders] = useState({});
  const containerRef = useRef();

  const fetchFolders = async () => {
    try {
      const response = await axiosInstance.get('/user/avatars/folders');
      setFolders(response.data.folders);
      
      // Start loading avatars for all folders
      response.data.folders.forEach(folder => {
        fetchAvatars(folder);
      });
    } catch (error) {
      toast.error("Failed to load avatar folders");
    }
  };

  const fetchAvatars = async (folder) => {
    if (!folder || loadingFolders[folder.path]) return;
    
    setLoadingFolders(prev => ({ ...prev, [folder.path]: true }));
    try {
      const response = await axiosInstance.get('/user/avatars/list', {
        params: {
          path: folder.path
        }
      });
      
      // Filter out .txt files and keep only image files
      const imageAvatars = response.data.images.filter(avatar => 
        !avatar.url.toLowerCase().endsWith('.txt')
      );
      
      setAvatarsByFolder(prev => ({
        ...prev,
        [folder.path]: imageAvatars
      }));
    } catch (error) {
      toast.error(`Failed to load avatars for ${folder.name}`);
    } finally {
      setLoadingFolders(prev => ({ ...prev, [folder.path]: false }));
    }
  };

  useEffect(() => {
    if (isOpen) {
      setAvatarsByFolder({});
      setLoadingFolders({});
      fetchFolders();
    }
  }, [isOpen]);

  const handleAvatarSelect = async (avatarUrl) => {
    try {
      const response = await axiosInstance.put("/user/avatar", { avatarUrl });
      console.log('Avatar update response:', response.data);
      const updatedUser = response.data;
      useAuthStore.getState().setUser(updatedUser);
      onAvatarSelect(avatarUrl);
      onClose();
    } catch (error) {
      console.error('Avatar update error:', error);
      toast.error("Failed to update avatar");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        ref={containerRef}
        className="bg-zinc-900 rounded-lg p-6 w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-zinc-900 z-10 py-2">
          <h2 className="text-2xl font-bold text-white">Choose Your Avatar</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-8">
          {folders.map((folder) => (
            <div key={folder.path} className="space-y-4">
              <h3 className="text-xl font-semibold text-white sticky top-14 bg-zinc-900 py-2 z-10 border-b border-zinc-800">
                {folder.name}
              </h3>
              
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                {avatarsByFolder[folder.path]?.map((avatar, index) => (
                  <button
                    key={avatar.id}
                    onClick={() => handleAvatarSelect(avatar.url)}
                    className="relative aspect-square overflow-hidden rounded-lg hover:ring-2 hover:ring-white transition-all"
                  >
                    <img
                      src={avatar.url}
                      alt={`${folder.name} Avatar ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>

              {loadingFolders[folder.path] && (
                <div className="flex justify-center items-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              )}

              {!loadingFolders[folder.path] && (!avatarsByFolder[folder.path] || avatarsByFolder[folder.path].length === 0) && (
                <div className="text-center text-gray-400 py-4">
                  No avatars found in {folder.name}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AvatarSelectionModal;
