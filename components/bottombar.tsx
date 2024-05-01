import { UserButton } from "@clerk/nextjs";

import { getApiLimitCount } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";
import MobileSidebar from "./mobile-sidebar";
import { FreeCounter } from "./free-counter";

const BottomBar = async () => {
  const apiLimitCount = await getApiLimitCount();
  const isPro = await checkSubscription();

  return (
    <div className="flex items-center p-4">
      <MobileSidebar apiLimitCount={apiLimitCount} isPro={isPro} />
      <div className="flex w-full justify-center items-center">
        <FreeCounter apiLimitCount={apiLimitCount} isPro={isPro} />
      </div>
      <div style={{marginRight: '4%', marginTop: 28}}>
        <UserButton afterSignOutUrl="/" />
      </div>
    </div>
  );
};

export default BottomBar;
