import React, { lazy } from "react";
import { Route, Routes } from "react-router-dom";
import { RoleAccess } from "src/app/_ezs/components/RoleAccess";
import { useRoles } from "src/app/_ezs/hooks/useRoles";
import SuspensedView from "src/app/routing/SuspensedView";

const HomePage = lazy(() => import("./pages/Home"));
const StudentPage = lazy(() => import('./pages/Student'))
const AttendancePage = lazy(() => import('./pages/Attendance'))
const StudentPendingPage = lazy(() => import('./pages/StudentPending'))

function CoursesPage(props) {
  const { course_co_ban, course_nang_cao } = useRoles(['course_co_ban', 'course_nang_cao'])
  return (
    <>
      <Routes>
        <Route element={<RoleAccess roles={course_co_ban.hasRight || course_nang_cao.hasRight} />}>
          <Route
            index
            element={
              <SuspensedView>
                <HomePage />
              </SuspensedView>
            }
          />
          <Route
            path='student-pending'
            element={
              <SuspensedView>
                <StudentPendingPage />
              </SuspensedView>
            }
          />
          <Route
            path='student/:id'
            element={
              <SuspensedView>
                <StudentPage />
              </SuspensedView>
            }
          />
          <Route
            path='attendance/:id'
            element={
              <SuspensedView>
                <AttendancePage />
              </SuspensedView>
            }
          />
        </Route>
      </Routes>
    </>
  )
}

export default CoursesPage;
