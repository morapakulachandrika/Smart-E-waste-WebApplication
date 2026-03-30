import { Outlet } from "react-router-dom";
import Footer from "../components/Footer";

export default function PublicLayout() {
  return (
    <>
      <Outlet />
      <Footer />
    </>
  );
}
