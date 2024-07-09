import { Outlet } from "react-router-dom";
import { LazyMotion, domAnimation } from "framer-motion";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <LazyMotion features={domAnimation}>
      <Outlet />
      <ToastContainer
        autoClose={1500}
        rtl={false}
        closeOnClick
        position="top-center"
        theme="colored"
        icon={false}
      />
    </LazyMotion>
  );
}

export default App;
