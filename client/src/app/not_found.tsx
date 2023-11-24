import { Unlink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex justify-center items-center align-center my-auto flex-col gap-6">
      <p className="uppercase tracking-[20px] text-destructive text-3xl">
        error 404
      </p>
      <div className="flex">
        <Unlink size={32} strokeWidth={1} absoluteStrokeWidth />
        <span className="pl-2 text-xl text-center capitalize">
          Your adventure ends here, traveler.
        </span>
      </div>
      <Button>
        <Link to="/">Go back home</Link>
      </Button>
    </div>
  );
};

export default NotFound;
