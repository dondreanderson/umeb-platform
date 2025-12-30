import { fetchJson } from "@/lib/api";

interface Token {
    access_token: string;
    token_type: string;
}

export const authService = {
    async login(username: string, password: string): Promise<Token> {
        const formData = new URLSearchParams();
        formData.append("username", username);
        formData.append("password", password);

        const token = await fetchJson<Token>("/api/v1/login/access-token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: formData.toString(),
        });

        if (token?.access_token) {
            localStorage.setItem("token", token.access_token);
        }

        return token;
    },

    logout() {
        localStorage.removeItem("token");
    },

    getToken() {
        return localStorage.getItem("token");
    }
};
