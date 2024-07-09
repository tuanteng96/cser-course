import React, { lazy } from "react";
import { Route, Routes } from "react-router-dom";
import SuspensedView from "src/app/routing/SuspensedView";

const HomePage = lazy(() => import("./pages/Home"));

function CoursesPage(props) {
  return (
    <>
      <Routes>
        <Route
          index
          element={
            <SuspensedView>
              <HomePage />
            </SuspensedView>
          }
        />
      </Routes>
    </>
  );
}

export default CoursesPage;
