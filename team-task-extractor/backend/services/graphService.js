const axios = require('axios');

class GraphService {
    constructor(accessToken) {
        this.accessToken = accessToken;
        this.baseURL = 'https://graph.microsoft.com/v1.0';
    }

    async getHeaders() {
        return {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
        };
    }

    // Get user's online meetings
    async getOnlineMeetings() {
        try {
            const headers = await this.getHeaders();
            const response = await axios.get(`${this.baseURL}/me/onlineMeetings`, { headers });
            return response.data;
        } catch (error) {
            console.error('Error fetching online meetings:', error.response?.data || error.message);
            throw error;
        }
    }

    // Get transcripts for a specific meeting
    async getMeetingTranscripts(meetingId) {
        try {
            const headers = await this.getHeaders();
            const response = await axios.get(
                `${this.baseURL}/me/onlineMeetings/${meetingId}/transcripts`,
                { headers }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching transcripts:', error.response?.data || error.message);
            throw error;
        }
    }

    // Get transcript content
    async getTranscriptContent(meetingId, transcriptId) {
        try {
            const headers = await this.getHeaders();
            const response = await axios.get(
                `${this.baseURL}/me/onlineMeetings/${meetingId}/transcripts/${transcriptId}/content`,
                { headers }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching transcript content:', error.response?.data || error.message);
            throw error;
        }
    }

    // Get user profile
    async getUserProfile() {
        try {
            const headers = await this.getHeaders();
            const response = await axios.get(`${this.baseURL}/me`, { headers });
            return response.data;
        } catch (error) {
            console.error('Error fetching user profile:', error.response?.data || error.message);
            throw error;
        }
    }
}

module.exports = GraphService;