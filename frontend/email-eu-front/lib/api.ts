const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface AuthResponse {
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
    };
    accessToken: string;
}

export interface ApiError {
    statusCode: number;
    message: string;
}

class ApiService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = API_BASE_URL;
    }

    private getHeaders(includeAuth: boolean = true): HeadersInit {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (includeAuth && typeof window !== 'undefined') {
            const token = localStorage.getItem('accessToken');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        return headers;
    }

    private async handleResponse<T>(response: Response): Promise<T> {
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'An error occurred' }));
            throw { statusCode: response.status, message: error.message || 'Request failed' };
        }
        return response.json();
    }

    // Auth endpoints
    async register(data: { name: string; email: string; password: string }): Promise<AuthResponse> {
        const response = await fetch(`${this.baseUrl}/auth/register`, {
            method: 'POST',
            headers: this.getHeaders(false),
            body: JSON.stringify(data),
        });
        return this.handleResponse<AuthResponse>(response);
    }

    async login(data: { email: string; password: string }): Promise<AuthResponse> {
        const response = await fetch(`${this.baseUrl}/auth/login`, {
            method: 'POST',
            headers: this.getHeaders(false),
            body: JSON.stringify(data),
        });
        return this.handleResponse<AuthResponse>(response);
    }

    async verifyToken(token: string): Promise<{ valid: boolean; user?: any }> {
        const response = await fetch(`${this.baseUrl}/auth/verify`, {
            method: 'POST',
            headers: this.getHeaders(false),
            body: JSON.stringify({ token }),
        });
        return this.handleResponse(response);
    }

    // Graph endpoints
    async getGraphStats(bypassCache: boolean = false) {
        if (!bypassCache && typeof window !== 'undefined') {
            const cached = sessionStorage.getItem('graph_stats');
            if (cached) return JSON.parse(cached);
        }

        const response = await fetch(`${this.baseUrl}/graph/stats`, {
            headers: this.getHeaders(),
        });
        const data = await this.handleResponse(response);

        if (typeof window !== 'undefined') {
            sessionStorage.setItem('graph_stats', JSON.stringify(data));
        }
        return data;
    }

    async getGraphActivity(bypassCache: boolean = false) {
        if (!bypassCache && typeof window !== 'undefined') {
            const cached = sessionStorage.getItem('graph_activity');
            if (cached) return JSON.parse(cached);
        }

        const response = await fetch(`${this.baseUrl}/graph/activity`, {
            headers: this.getHeaders(),
        });
        const data = await this.handleResponse(response);

        if (typeof window !== 'undefined') {
            sessionStorage.setItem('graph_activity', JSON.stringify(data));
        }
        return data;
    }

    async getNodes(bypassCache: boolean = false) {
        if (!bypassCache && typeof window !== 'undefined') {
            const cached = sessionStorage.getItem('graph_nodes');
            if (cached) return JSON.parse(cached);
        }

        const response = await fetch(`${this.baseUrl}/graph/nodes`, {
            headers: this.getHeaders(),
        });
        const data = await this.handleResponse(response);

        if (typeof window !== 'undefined') {
            sessionStorage.setItem('graph_nodes', JSON.stringify(data));
        }
        return data;
    }

    async getEdges(bypassCache: boolean = false) {
        if (!bypassCache && typeof window !== 'undefined') {
            const cached = sessionStorage.getItem('graph_edges');
            if (cached) return JSON.parse(cached);
        }

        const response = await fetch(`${this.baseUrl}/graph/edges`, {
            headers: this.getHeaders(),
        });
        const data = await this.handleResponse(response);

        if (typeof window !== 'undefined') {
            sessionStorage.setItem('graph_edges', JSON.stringify(data));
        }
        return data;
    }

    async savePrediction(data: { userId: string; type: string; input: any; result: any; confidence: number }) {
        const response = await fetch(`${this.baseUrl}/graph/prediction/save`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(data),
        });
        return this.handleResponse(response);
    }

    async getPredictionHistory(userId: string, limit: number = 5, offset: number = 0) {
        const response = await fetch(`${this.baseUrl}/graph/prediction/history?userId=${userId}&limit=${limit}&offset=${offset}`, {
            headers: this.getHeaders(),
        });
        return this.handleResponse(response);
    }

    async getNodeDetails(id: string | number) {
        const response = await fetch(`${this.baseUrl}/graph/node/${id}`, {
            method: 'POST', // Backend expects POST for some reason based on controller
            headers: this.getHeaders(),
        });
        return this.handleResponse(response);
    }

    async getDegreeDistribution() {
        const response = await fetch(`${this.baseUrl}/graph/degree-distribution`, {
            headers: this.getHeaders(),
        });
        return this.handleResponse(response);
    }

    async getCentrality() {
        const response = await fetch(`${this.baseUrl}/graph/centrality`, {
            headers: this.getHeaders(),
        });
        return this.handleResponse(response);
    }

    async getClusteringCoefficient() {
        const response = await fetch(`${this.baseUrl}/graph/clustering-coefficient`, {
            headers: this.getHeaders(),
        });
        return this.handleResponse(response);
    }

    // Visualization endpoints
    async getGraphLayout() {
        const response = await fetch(`${this.baseUrl}/visualization/graph-layout`, {
            headers: this.getHeaders(),
        });
        return this.handleResponse(response);
    }

    async getCommunities() {
        const response = await fetch(`${this.baseUrl}/visualization/communities`, {
            headers: this.getHeaders(),
        });
        return this.handleResponse(response);
    }

    async filterGraph(departments: number[]) {
        const response = await fetch(`${this.baseUrl}/visualization/filter`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ departments }),
        });
        return this.handleResponse(response);
    }

    async updateUser(id: string, data: any): Promise<AuthResponse['user']> {
        const response = await fetch(`${this.baseUrl}/users/${id}`, {
            method: 'PATCH',
            headers: this.getHeaders(),
            body: JSON.stringify(data),
        });
        return this.handleResponse(response);
    }

    // ML endpoints
    async predictDepartment(nodeId: number) {
        const response = await fetch(`${this.baseUrl}/ml/predict/department`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ node_id: nodeId }),
        });
        return this.handleResponse(response);
    }

    async simulateDepartment(neighborIds: number[]) {
        const response = await fetch(`${this.baseUrl}/ml/predict/simulate`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ neighbor_ids: neighborIds }),
        });
        return this.handleResponse(response);
    }

    async predictUnseen(index?: number) {
        const url = index !== undefined
            ? `${this.baseUrl}/ml/predict/unseen?index=${index}`
            : `${this.baseUrl}/ml/predict/unseen`;
        const response = await fetch(url, {
            headers: this.getHeaders(),
        });
        return this.handleResponse(response);
    }

    async predictLink(source: number, target: number) {
        const response = await fetch(`${this.baseUrl}/ml/links/predict`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ source, target }),
        });
        return this.handleResponse(response);
    }

    async simulateLink(neighborIds: number[], target: number) {
        const response = await fetch(`${this.baseUrl}/ml/links/simulate`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ neighbor_ids: neighborIds, target }),
        });
        return this.handleResponse(response);
    }

    async detectCommunities(method: string = 'louvain') {
        const response = await fetch(`${this.baseUrl}/ml/community/detect`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ method }),
        });
        return this.handleResponse(response);
    }

    async getEmbeddingsVisualization(method: string = 'pca') {
        const response = await fetch(`${this.baseUrl}/ml/embeddings/visualize?method=${method}`, {
            headers: this.getHeaders(),
        });
        return this.handleResponse(response);
    }

    async getAnalysisMetrics() {
        const response = await fetch(`${this.baseUrl}/ml/analysis/metrics`, {
            headers: this.getHeaders(),
        });
        return this.handleResponse(response);
    }

    async getHealth() {
        const response = await fetch(`${this.baseUrl}/health`, {
            headers: this.getHeaders(false),
        });
        return this.handleResponse(response);
    }
}

export const apiService = new ApiService();
export default apiService;
