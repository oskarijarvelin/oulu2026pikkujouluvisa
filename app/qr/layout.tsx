import Header from "@/components/molecules/header";
import ImageBackground from "@/components/atoms/image-background";
import MaxWidthWrapper from "@/components/atoms/max-width-wrapper";

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-harmaa dark:bg-yotaivas xs:py-10 md:py-12 w-full h-full min-h-screen transition relative">
      {/* BACKGROUND PATTERN  */}
      <ImageBackground />
      <main className="h-full xl:h-auto flex items-center justify-center">{children}</main>
    </div>
  );
};

export default RootLayout;
