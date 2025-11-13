const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-valkoinen dark:bg-yotaivas xs:py-10 md:py-12 w-full h-full min-h-screen transition relative">
      <main className="h-full xl:h-auto flex items-center justify-center">{children}</main>
    </div>
  );
};

export default RootLayout;
