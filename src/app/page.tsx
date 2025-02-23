/* eslint-disable @next/next/no-img-element */
"use client";

import { FC, useState } from "react";

export default function Home() {
  const [result, setResult] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<string>("Enter a URL to add the list.");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setStatusMessage("Fetching data...");

    const formData = new FormData(e.currentTarget);
    const url = formData.get("url");
    try {
      const response = await fetch(`/api/scrape?url=${url}`);
      const data = await response.json();
      setResult(data);
      setStatusMessage("Data fetched successfully.");
    } catch (error) {
      console.error(error);
      setStatusMessage("Failed to fetch. Please check the URL and try again.");
    }
  };

  return (
    <div>
      <div>
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input type="url" name="url" placeholder="Enter URL" required className="w-full" />
          <button type="submit" className="w-[8em]">
            Add
          </button>
        </form>
      </div>
      <pre className="text-sky-600">{statusMessage}</pre>
      <pre>{JSON.stringify(result)}</pre>
      {result && <RoomCard room={result} />}
    </div>
  );
}

const RoomCard: FC = (room) => {
  return (
    <div>
      <div className="mb-4">
        <div className="flex justify-between">
          <div>
            <h3 className="mb-0 line-clamp-1 text-lg font-bold">{room.name}</h3>
            {room.addressLink ? (
              <a href={room.addressLink} target="_blank" className="text-sm">
                {room.address}
              </a>
            ) : (
              <p className="text-sm">{room.address}</p>
            )}
            <p className="text-sm">
              家賃:&nbsp;<span className="text-lg">{room.rent}</span>
              &nbsp;/&nbsp;管理費:&nbsp;
              <span className="text-lg">{room.maintenanceFee}</span>
            </p>
          </div>
          <div>
            <div className="aspect-square w-20">
              {room.thumbnails && (
                <img
                  src={room.thumbnails[0]}
                  alt="Room Thumbnail"
                  className="h-full w-full cursor-pointer bg-black object-contain shadow"
                />
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2 text-sm">
          <input type="text" className="w-full" placeholder="Input comment here" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap">
          {room.thumbnails?.map((thumbnail: string, index: number) => (
            <div key={index} className="aspect-square w-1/5 p-1 sm:w-1/6">
              <img
                src={thumbnail}
                alt={`Image ${index}`}
                className="h-full w-full cursor-pointer bg-black object-contain shadow"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
