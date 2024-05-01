
import BottomBar from "@/components/bottombar";
import "./layout.css";

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {


  return (
    <div className="h-full relative bg-black dashboard">
      <main className="">
        {/* <Navbar /> */}
        {children}
        <BottomBar />
      </main>
    </div>
  );
};

export default DashboardLayout;
