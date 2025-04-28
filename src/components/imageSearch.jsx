import axios from "axios";
import React, { useState, useRef } from "react";

const API_URL = "https://api.unsplash.com/search/photos";
const IMAGE_PER_PAGE = 20;

function ImageSearch() {
  //test if api key is working
  // console.log("key", import.meta.env.VITE_UNSPLASH_API_KEY);
  const searchInput = useRef(null);
  const [images, setImages] = useState([]);
  const [totalPages, setTotalPages] = useState(0);

  // useEffect(() => {
  //   const getImages = async () => {};

  //   getImages();
  // }, []);

  const fetchImages = async () => {
    try {
      const { data } = await axios.get(`${API_URL}?query=${searchInput.current.value}&page=1&per_page=${IMAGE_PER_PAGE}&client_id=${import.meta.env.VITE_UNSPLASH_API_KEY}`);
      setImages(data.results);
      setTotalPages(data.total_pages);
      // console.log("result", result.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSearch = (event) => {
    event.preventDefault();
    console.log(searchInput.current.value);
    fetchImages();
  };

  const handleSelection = (selection) => {
    searchInput.current.value = selection;
    fetchImages();
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-4">
      {/* Bagian Form dan Button */}
      <div className="w-full max-w-md space-y-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-purple-500">Image Search</h1>

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

      {/* Bagian Grid Image - DIPISAH dari form */}
      <div className="w-full flex-1">
        <div className="grid grid-cols-4 grid-rows-5 gap-2 w-full h-screen">
          {images.map((image) => (
            <div key={image.id} className="w-full h-full overflow-hidden">
              <img src={image.urls.small} alt={image.alt_description} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default ImageSearch;
