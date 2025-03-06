import { type AppProps } from "next/app";
import { useRouter } from "next/router";
import DynamicHead from "~/components/DynamicHead";
import GeneralLayout from "~/components/layouts/GeneralLayout";
import "~/styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  const { pathname } = useRouter();

  return (
    <>
      <DynamicHead currentPath={pathname} />
      <GeneralLayout>
        <Component {...pageProps} />
      </GeneralLayout>
    </>
  );
}

export default MyApp;
