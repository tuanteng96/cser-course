import { BrowserRouter, Route, Routes } from "react-router-dom";
import PrivateRoutes from "./PrivateRoutes";
import App from "../App";
import SuspensedView from "./SuspensedView";
import { lazy } from "react";

const { PUBLIC_URL } = import.meta.env;

const UnauthorizedPage = lazy(() => import('../pages/Unauthorized'))

export default function AppRoutes() {
  return (
    <BrowserRouter basename={PUBLIC_URL}>
      <Routes>
        <Route element={<App />}>
          <Route
            path='unauthorized'
            element={
              <SuspensedView>
                <UnauthorizedPage />
              </SuspensedView>
            }
          />
          <Route path='/*' element={<PrivateRoutes />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
