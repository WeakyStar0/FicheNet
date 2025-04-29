// frontend/src/api.js
const API_URL = "http://localhost:5000";

export const fetchBackend = async () => {
    try {
        const response = await fetch(`${API_URL}/`);
        const data = await response.text();
        return data;
    } catch (error) {
        console.error("Erro ao buscar dados do backend:", error);
    }
};
