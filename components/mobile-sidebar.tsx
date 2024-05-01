"use client";

import { Menu } from "lucide-react";
import { useEffect, useState } from "react";

import Sidebar from "./sidebar";
import { Button } from "./ui/button";
// import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

const MobileSidebar = ({
  apiLimitCount = 0,
  isPro = false,
}: {
  apiLimitCount: number;
  isPro: boolean;
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  // <Sheet>
  //     <SheetTrigger>
  //       <Button variant="ghost" size="icon" className="md:hidden">
  //         <Menu />
  //       </Button>
  //     </SheetTrigger>
  //     <SheetContent side="left" className="p-0">
  //       <Sidebar apiLimitCount={apiLimitCount} isPro={isPro} />
  //     </SheetContent>
  //   </Sheet>

  return (
    <>
      <div>Mobile sidebar</div>
    </>
  );
};

export default MobileSidebar;
