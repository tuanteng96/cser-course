import axios from "axios";

class Http {
  constructor() {
    this.accessToken = window?.top?.Info?.token || "";
    this.accessStockID = window?.top?.Info?.CrStockID || "";
    this.instance = axios.create({
      baseURL:
        import.meta.env.MODE === "development"
          ? import.meta.env.VITE_HOST
          : window.location.origin,
      timeout: 50000,
      headers: {
        "content-type": "text/plain",
      },
      withCredentials: true,
    });
    this.instance.interceptors.request.use(
      (config) => {
        if (this.accessToken) {
          config.headers.Authorization = "Bearer " + this.accessToken;
        }
        if (this.accessStockID) {
          config.headers.StockID = this.accessStockID;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
    // Add response interceptor
    this.instance.interceptors.response.use(
      ({ data, ...response }) => {
        return {
          data,
        };
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }
}

const http = new Http().instance;
export default http;
