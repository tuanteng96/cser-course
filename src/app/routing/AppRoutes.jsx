import { BrowserRouter, Route, Routes } from "react-router-dom";
import PrivateRoutes from "./PrivateRoutes";
import App from "../App";

const { PUBLIC_URL } = import.meta.env;

export default function AppRoutes() {
  return (
    <BrowserRouter basename={PUBLIC_URL}>
      <Routes>
        <Route element={<App />}>
          <Route path="/*" element={<PrivateRoutes />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
