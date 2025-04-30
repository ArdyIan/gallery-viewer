import axios from "axios";
import React, { useState, useRef, useEffect, useCallback } from "react";

const API_URL = "https://api.unsplash.com/search/photos";
const IMAGE_PER_PAGE = 20;

function ImageSearch() {
  //test if api key is working
  // console.log("key", import.meta.env.VITE_UNSPLASH_API_KEY);
  const searchInput = useRef(null);
  const [images, setImages] = useState([]);
  const [pagination, setPagination] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchImages = useCallback(async () => {
    try {
      if (searchInput.current.value) {
        setErrorMsg("");
        const { data } = await axios.get(`${API_URL}?query=${searchInput.current.value}&page=${pagination}&per_page=${IMAGE_PER_PAGE}&client_id=${import.meta.env.VITE_UNSPLASH_API_KEY}`);
        setImages(data.results);
        setTotalPages(data.total_pages);
        // console.log("result", result.data);
      }
    } catch (error) {
      setErrorMsg("Failed to fetch images. Try again later.");
      console.log(error);
    }
  }, [pagination]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  // function to avoid repetition
  const resetSearch = () => {
    setPagination(1);
    fetchImages();
  };

  const handleSearch = (event) => {
    event.preventDefault();
    // console.log(searchInput.current.value);
    resetSearch();
  };

  const handleSelection = (selection) => {
    searchInput.current.value = selection;
    resetSearch();
  };

  // pagination test
  // console.log("page", pagination);

  return (
    <main className="min-h-screen p-4">
      <div className="max-w-xl mx-auto space-y-6">
        {/* SEARCH SECTION */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-purple-500">Image Search</h1>
          {errorMsg && <p className="text-red-500">{errorMsg}</p>}

          <div className="w-full">
            <form onSubmit={handleSearch}>
              <input type="search" placeholder="Cari gambar disini..." ref={searchInput} className="text-black-900 w-full border-2 border-purple-300 p-2 rounded-md" />
            </form>
          </div>

          <div className="flex flex-row gap-4 justify-center flex-wrap">
            <button onClick={() => handleSelection("nature")} className="bg-purple-400 p-2 rounded-md text-white">
              Nature
            </button>
            <button onClick={() => handleSelection("bird")} className="bg-purple-400 p-2 rounded-md text-white">
              Bird
            </button>
            <button onClick={() => handleSelection("computer")} className="bg-purple-400 p-2 rounded-md text-white">
              Computer
            </button>
            <button onClick={() => handleSelection("landscape")} className="bg-purple-400 p-2 rounded-md text-white">
              Landscape
            </button>
          </div>
        </div>
      </div>
      {/* IMAGE GRID */}

      {images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pt-4">
          {images.map((image) => (
            <div key={image.id} className="relative group overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <img
                src={image.urls.small}
                alt={image.alt_description || "Unsplash Image"}
                className="w-full h-48 object-hover hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/300?text=Image+Not+Available";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                <p className="text-white text-sm truncate">{image.alt_description || "No Description"}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-500">{searchInput.current?.value ? "No images found .Try another search" : "Enter a search term to display images"}</div>
      )}
      <div className="flex justify-center gap-8 mt-8 w-full">
        {pagination > 1 && (
          <button variant="secondary" onClick={() => setPagination(pagination - 1)} className="bg-purple-400 p-2 rounded-md text-white">
            Previous
          </button>
        )}
        {pagination < totalPages && (
          <button variant="secondary" onClick={() => setPagination(pagination + 1)} className="bg-purple-400 p-2 rounded-md text-white">
            Next
          </button>
        )}
      </div>
    </main>
  );
}

export default ImageSearch;
