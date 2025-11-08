import { useState } from "react";

export function usePhotosHandler(initial = [], maxPhotos = 6) {
  const [photos, setPhotos] = useState(initial);
  const [error, setError] = useState(null);

  const onPhotosChange = (e) => {
    const files = Array.from(e.target.files);

    // Check if adding these files exceeds maxPhotos
    if (files.length + photos.length > maxPhotos) {
      setError(`You can upload up to ${maxPhotos} photo${maxPhotos > 1 ? "s" : ""} only.`);
      return;
    }

    // Validate each file
    for (let file of files) {
      if (!file.type.startsWith("image/")) {
        setError("Only image files are allowed.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Each file must be under 5MB.");
        return;
      }
    }

    setError(null);
    setPhotos((prev) => [...prev, ...files]);
  };

  const removePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setError(null); // Clear error on remove to allow adding again
  };
  const resetPhotos = () => {
    setPhotos([]);
    setError(null);
  };



  return { photos, error, onPhotosChange,resetPhotos, removePhoto, setPhotos };
}
// const { photos, error, onPhotosChange, removePhoto } = usePhotosHandler([], 1); for 1 photo
// const { photos, error, onPhotosChange, removePhoto } = usePhotosHandler([], 6); for 6 photo