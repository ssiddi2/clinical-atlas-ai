import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { PublicThemeProvider } from "./PublicThemeProvider";

const PublicLayout = () => {
  return (
    <PublicThemeProvider>
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </PublicThemeProvider>
  );
};

export default PublicLayout;
