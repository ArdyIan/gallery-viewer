import axios from "axios";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = "https://api.unsplash.com/search/photos";
const IMAGE_PER_PAGE = 20;

const ExpandableCard = ({ imageSrc, imageAlt, onClick, ...props }) => {
  return (
    <motion.div className="relative overflow-hidden rounded-lg shadow-lg cursor-pointer" onClick={onClick} whileHover={{ scale: 1.03 }}>
      <img src={imageSrc} alt={imageAlt} className="w-full h-64 object-cover" loading="lazy" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end p-4">
        <p className="text-white text-sm truncate">{props.description || "No description available"}</p>
      </div>
    </motion.div>
  );
};

const ImagePopup = ({ image, onClose, onNext, onPrev, hasNext, hasPrev, relatedImages }) => {
  const popupRef = useRef(null);
  if (!image?.urls) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Close BUtton */}
        <button onClick={onClose} className="absolute top-4 right-4 text-white text-2xl z-10 bg-black/50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/70 transition-colors" aria-label="Close">
          &times;
        </button>
        <div onClick={(e) => e.stopPropagation()} ref={popupRef} className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] flex overflow-hidden">
          {/* Navigation button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            disabled={!hasPrev}
            className={`absolute left-4 top-1/2 -translate-y-1/2 text-white text-4xl z-10 bg-black/50 rounded-full w-12 h-12 flex items-center justify-center ${!hasPrev ? "opacity-50 cursor-not-allowed" : "hover:bg-black/70"}`}
            aria-label="Previous Image"
          >
            &#10094;
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation(); 
              onNext();
            }}
            disabled={!hasNext}
            className={`absolute right-4 top-1/2 -translate-y-1/2 text-white text-4xl z-10 bg-black/50 rounded-full w-12 h-12 flex items-center justify-center ${!hasNext ? "opacity-50 cursor-not-allowed" : "hover:bg-black/70"}`}
            aria-label="Next Image"
          >
            &#10095;
          </button>

          {/* Main Container */}
          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Image */}
            <div className="p-6 flex-1 flex items-center justify-center max-h-[60vh]">
              <img src={image.urls.regular} alt={image.alt_description || "Unsplash Image"} className="max-w-full max-h-full object-contain" />
            </div>
            {/* Info Section */}
            <div className="p-6 border-t border-gray-200">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center mb-4">
                    <img src={image.user.profile_image.medium} alt={image.user.name} className="w-10 h-10 rounded-full mr-3" />
                    <div>
                      <a href={image.user.links.html} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline block">
                        {image.user.name}
                      </a>
                      <span className="text-sm text-gray-600 ">@{image.user.username}</span>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4">{image.description || image.alt_description || "No Description Available"}</p>
                </div>
                <a href={`${image.links.download}?force=true`} target="_blank" rel="noopener noreferrer" className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md transition-colors whitespace-nowrap ml-4" download>
                  Download
                </a>
              </div>
            </div>
          </div>
          {/* Related Image Section */}
          <div className="w-80 border-l border-gray-200 flex flex-col ">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-bold text-lg ">Related Images</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {relatedImages.map((img) => (
                <div
                  key={img.id}
                  className="cursor-pointer group"
                  onClick={() => {
                    const newIndex = relatedImages.findIndex((i) => i.id === img.id);
                    if (newIndex !== -1) {
                      onClose();
                    }
                  }}
                >
                  <div className="relative overflow-hidden rounded-lg">
                    <img src={img.urls.small} alt={img.alt_description || "Related Image"} className="w-full h-32 object-cover  group-hover:opacity-90 transition-opacity" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                      <p className="text-white text-sm truncate">{img.alt_description || "No Description"}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

{
  /* Overlay */
}

function ImageSearch() {
  const searchInput = useRef(null);
  const [images, setImages] = useState([]);
  const [pagination, setPagination] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const fetchImages = useCallback(async () => {
    if (!query.trim()) {
      setImages([]);
      return;
    }
    setIsLoading(true);
    setErrorMsg("");
    try {
      const { data } = await axios.get(`${API_URL}?query=${searchInput.current.value}&page=${pagination}&per_page=${IMAGE_PER_PAGE}&client_id=${import.meta.env.VITE_UNSPLASH_API_KEY}`);
      setImages(data.results);
      setTotalPages(data.total_pages);
      // console.log("result", result.data);
    } catch (error) {
      setErrorMsg("Failed to fetch images. Try again later.");
      console.log("Error fetching images:", error);
    } finally {
      setIsLoading(false);
    }
  }, [query, pagination]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchImages();
    }, 500);

    return () => clearTimeout(timer);
  }, [fetchImages]);

  const handleImageClick = (image) => {
    const index = images.findIndex((img) => img.id === image.id);
    setCurrentImageIndex(index);
    setSelectedImage(image);
  };

  const handleNextImage = () => {
    if (currentImageIndex < images.length - 1) {
      const newIndex = currentImageIndex + 1;
      setCurrentImageIndex(newIndex);
      setSelectedImage(images[newIndex]);
    }
  };

  const handlePrevImage = () => {
    if (currentImageIndex > 0) {
      const newIndex = currentImageIndex - 1;
      setCurrentImageIndex(newIndex);
      setSelectedImage(images[newIndex]);
    }
  };

  const handleClosePopup = () => {
    setSelectedImage(null);
  };

  const handleSearch = (event) => {
    event.preventDefault();
    setQuery(searchInput.current.value.trim());
    setPagination(1);
  };

  const handleSelection = (selection) => {
    searchInput.current.value = selection;
    setQuery(selection);
    setPagination(1);
  };

  const handleNext = () => {
    if (pagination < totalPages) {
      setPagination((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (pagination > 1) {
      setPagination((prev) => prev - 1);
    }
  };

  return (
    <main className="min-h-screen p-4 max-w-7xl mx-auto">
      {/* SEARCH SECTION */}
      <div className="max-w-xl mx-auto space-y-6 mb-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-purple-500">Image Search</h1>
          {errorMsg && <p className="text-red-500">{errorMsg}</p>}

          <form onSubmit={handleSearch} className="flex gap-2">
            <input type="search" placeholder="Search Images..." ref={searchInput} className="flex-1 border-2 border-purple-300 p-2 rounded-md" />
            <button type="submit" className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 transition-colors">
              Search
            </button>
          </form>
          <div className="flex flex-wrap gap-2 justify-center">
            {["Nature", "Bird", "Computer", "Landscape"].map((item) => (
              <button key={item} onClick={() => handleSelection(item.toLowerCase())} className="bg-purple-400 px-3 py-1 rounded-md text-white hover:bg-purple-500 transition-colors">
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result */}
      {isLoading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
          <p className="mt-2">Loading images...</p>
        </div>
      ) : images.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {images.map((image) => (
              <ExpandableCard
                key={image.id}
                imageSrc={image.urls.regular}
                imageAlt={image.alt_description || "Unsplash Image"}
                title={image.alt_description?.substring(0, 30) || "Beautifull Image"}
                description={image.alt_description || "No description available"}
                username={image.user.username}
                userProfile={image.user.links.html}
                userImage={image.user.profile_image.small}
                onClick={() => handleImageClick(image)}
              />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-4 mt-8">
            <button onClick={handlePrev} disabled={pagination <= 1 || isLoading} className={`px-4 py-2 rounded-md ${pagination <= 1 ? "bg-gray-300 cursor-not-allowed" : "bg-purple-500 text-white hover:bg-purple-600"}`}>
              Previous
            </button>
            <span className="text-gray-700">
              Page {pagination} of {totalPages}
            </span>

            <button onClick={handleNext} disabled={pagination >= totalPages || isLoading} className={`px-4 py-2 rounded-md ${pagination >= totalPages ? "bg-gray-300 cursor-not-allowed" : "bg-purple-500 text-white hover:bg-purple-600"}`}>
              Next
            </button>
          </div>
        </>
      ) : (
        <div className="text-center py-20 text-gray-500">{query ? "No images found. Try another search." : "Enter a search term to display images"}</div>
      )}

      {/* Popup component */}
      {selectedImage && (
        <ImagePopup
          image={selectedImage}
          onClose={handleClosePopup}
          onNext={handleNextImage}
          onPrev={handlePrevImage}
          hasNext={currentImageIndex < images.length - 1}
          hasPrev={currentImageIndex > 0}
          relatedImages={images.filter((img) => img.id !== selectedImage.id).slice(0, 5)}
        />
      )}
    </main>
  );
}
export default ImageSearch;
