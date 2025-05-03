import axios from "axios";
// import { button, div, image, title } from "motion/react-client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "motion/react";

const API_URL = "https://api.unsplash.com/search/photos";
const IMAGE_PER_PAGE = 20;

const ExpandableCard = ({
  imageSrc = "https://via.placeholder.com/400x300",
  imageAlt = "Card Image",
  title = "Card Title",
  description = "No description available",
  username = "Unknown",
  userProfile = "https://unsplash.com",
  userImage = "https://via.placeholder.com/100",
}) => {
  const [isHovered, setIsHovered] = useState(false);

  {
    /* Overlay */
  }
  return (
    <motion.div
      className="relative w-full max-w-md mx-auto  overflow-hidden rounded-lg shadow-xl/30 "
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ height: "300px" }}
      whileHover={{ height: "450px" }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className="border-0 shadow-lg shadow-purple/50 h-full">
        <div className="relative w-full h-[300px]">
          <img src={imageSrc} alt={imageAlt} className="w-full h-full object-cover " />
        </div>
        <div className="p-4 bg-white">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: isHovered ? 1 : 0 }} transition={{ duration: 0.2, delay: isHovered ? 0.1 : 0 }}>
            <div className="flex items-center mb-2">
              <img src={userImage} alt={username} className="w-8 h-8 rounded-full mr-2 shadow-xl/30" />
              <a href={userProfile} target="_blank" rel="noopener noreferrer" className="text-black font-medium hover:underline">
                @{username}
              </a>
            </div>
            <h3 className="text-black text-lg font-bold line-clamp-1">{title}</h3>
            <p className="text-black text-sm line-clamp-2">{description}</p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

function ImageSearch() {
  const searchInput = useRef(null);
  const [images, setImages] = useState([]);
  const [pagination, setPagination] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState("");

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
    </main>
  );
}
export default ImageSearch;
