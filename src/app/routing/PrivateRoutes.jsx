import { lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import SuspensedView from "./SuspensedView";

const CoursesPage = lazy(() => import("../pages/courses"));

function PrivateRoutes() {
  return (
    <>
      <Routes>
        <Route
          path="courses/*"
          element={
            <SuspensedView>
              <CoursesPage />
            </SuspensedView>
          }
        />
        <Route index element={<Navigate to="/courses" />} />
      </Routes>
    </>
  );
}

export default PrivateRoutes;
