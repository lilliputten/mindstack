type TAwaitedLocaleProps = {
  params: Promise<{ locale: string; categoryId: string }>;
};

type TViewCategoryLayoutProps = TAwaitedLocaleProps & {
  children: React.ReactNode;
  edit: React.ReactNode; // slot from @edit
};

export default async function ViewCategoryLayout(props: TViewCategoryLayoutProps) {
  const {
    children,
    edit,
    // params: paramsPromise, // Promise
  } = props;
  // const { locale, categoryId } = await paramsPromise;

  return (
    <>
      {children}
      {edit}
    </>
  );
}
