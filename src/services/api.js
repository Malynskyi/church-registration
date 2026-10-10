import axios from "axios";

export const api = axios.create({
    baseURL: "https://church-registration-api.onrender.com",
});