import React from "react";

const Loading = () => {
  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-md flex items-center justify-center z-50">
      <div className="flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
        <div className="text-primary mt-4 font-bold"></div>
      </div>
    </div>
  );
};

export default Loading;
