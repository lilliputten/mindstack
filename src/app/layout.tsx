type TRootLayoutProps = {
  children: React.ReactNode;
};

async function ZeroLayout({ children }: TRootLayoutProps) {
  return <>{children}</>;
}

export default ZeroLayout;
