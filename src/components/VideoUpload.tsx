"use client";

import React from "react";

const VideoUpload = () => {
  async function uploadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    console.log("upload!", file);
  }

  return (
    <div className="p-6 max-w-lg mx-auto border rounded-lg shadow-md bg-white">
      <h1 className="text-xl font-semibold mb-4">Upload de Vidéo</h1>
      <label className="block text-sm font-medium text-gray-700">
        Sélectionnez une vidéo MP4
      </label>
      <input
        type="file"
        accept="video/mp4"
        className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        onChange={(e) => uploadFile(e)}
      />
    </div>
  );
};

export default VideoUpload;
