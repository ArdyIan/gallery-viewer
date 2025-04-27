import React from "react";

const ImageSearch = () => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-purple-500">Image Search</h1>

        <div className="w-full">
          <input type="text" placeholder="Cari gambar disini..." className="text-black-900 w-full border-2 border-purple-300 p-2 rounded-md" />
        </div>

        <div className="flex flex-row gap-4 justify-center flex-wrap ">
          <button className="bg-purple-400 p-2 rounded-md text-white" variant="outline">
            Kategori 1
          </button>
          <button className="bg-purple-400 p-2 rounded-md text-white" variant="outline">
            Kategori 1
          </button>
          <button className="bg-purple-400 p-2 rounded-md text-white" variant="outline">
            Kategori 1
          </button>
          <button className="bg-purple-400 p-2 rounded-md text-white" variant="outline">
            Kategori 1
          </button>
        </div>
      </div>
    </main>
  );
};

export default ImageSearch;
