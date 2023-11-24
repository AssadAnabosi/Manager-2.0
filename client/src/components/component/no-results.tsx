import React from "react";

import { SearchX } from "lucide-react";

const NoResults = () => {
  return (
    <div className="flex justify-center items-center align-center my-auto h-[335px]">
      <SearchX size={32} absoluteStrokeWidth />
      <p className="pl-2 text-2xl text-center capitalize">
        no matching results found
      </p>
    </div>
  );
};

export default NoResults;
