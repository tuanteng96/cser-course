import http from 'src/app/utils/http'

const CourseAPI = {
  list: (body) => http.post(`/api/v3/course@list`, JSON.stringify(body)),
  addEditCourse: (body) => http.post(`/api/v3/course@edit`, JSON.stringify(body)),
  deleteCourse: (body) => http.post(`/api/v3/course@delete`, JSON.stringify(body))
}

export default CourseAPI
