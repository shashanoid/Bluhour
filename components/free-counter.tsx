"use client";

import { FC, useEffect, useState } from "react";
import { MAX_FREE_COUNTS } from "@/constants";
import useProModal from "@/hooks/use-pro-modal";
import { Zap } from "lucide-react";
import { Button } from "./ui/button";

interface FreeCounterProps {
  apiLimitCount: number;
  isPro: boolean;
}

export const FreeCounter: FC<FreeCounterProps> = ({
  apiLimitCount = 0,
  isPro = false,
}) => {
  const [mounted, setMounted] = useState(false);
  const proModal = useProModal();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isPro) {
    return null;
  }

  return (
    <Button
      variant="outline"
      className="text-xs p-1 border-gray-300 text-gray-800 bg-gray-100"
      onClick={proModal.onOpen}
      style={{
        marginRight: 10,
        height: 32,
        backgroundColor: "rgb(137 137 137 / 52%)",
        color: "white",
        backdropFilter: "blur(10px)",
        borderRadius: 8,
        border: "0.5px solid rgba(214, 214, 214, 0.1)",
      }}
    >
      {apiLimitCount} / {MAX_FREE_COUNTS}{" "}
      <Zap className="w-3 h-3 ml-1 fill-gray-600" />
    </Button>
  );
};

export default FreeCounter;
