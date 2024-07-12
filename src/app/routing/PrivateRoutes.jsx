import { lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

const CoursesPage = lazy(() => import('../pages/courses'))

function PrivateRoutes() {
  return (
    <>
      <Routes>
        <Route path='courses/*' element={<CoursesPage />} />
        <Route index element={<Navigate to='/courses' />} />
      </Routes>
    </>
  )
}

export default PrivateRoutes
