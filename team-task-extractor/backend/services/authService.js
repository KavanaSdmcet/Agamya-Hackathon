const msal = require('@azure/msal-node');
const axios = require('axios');
if (!process.env.AZURE_CLIENT_ID || !process.env.AZURE_CLIENT_SECRET || !process.env.AZURE_TENANT_ID) {
    console.error('❌ Missing Azure credentials in .env file!');
    console.log('Required variables:');
    console.log('- AZURE_CLIENT_ID');
    console.log('- AZURE_CLIENT_SECRET');
    console.log('- AZURE_TENANT_ID');
    process.exit(1);
}
const msalConfig = {
    auth: {
        clientId: process.env.AZURE_CLIENT_ID,
        clientSecret: process.env.AZURE_CLIENT_SECRET,
        authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`
    }
};

const cca = new msal.ConfidentialClientApplication(msalConfig);

class AuthService {
    static getAuthUrl() {
        const authCodeUrlParameters = {
            scopes: [
                'https://graph.microsoft.com/OnlineMeetingTranscript.Read.All',
                'https://graph.microsoft.com/OnlineMeeting.Read.All',
                'https://graph.microsoft.com/User.Read'
            ],
            redirectUri: process.env.REDIRECT_URI,
        };

        return cca.getAuthCodeUrl(authCodeUrlParameters);
    }

    static async getTokenByCode(code) {
        const tokenRequest = {
            code,
            scopes: [
                'https://graph.microsoft.com/OnlineMeetingTranscript.Read.All',
                'https://graph.microsoft.com/OnlineMeeting.Read.All',
                'https://graph.microsoft.com/User.Read'
            ],
            redirectUri: process.env.REDIRECT_URI,
        };

        try {
            const response = await cca.acquireTokenByCode(tokenRequest);
            return response;
        } catch (error) {
            console.error('Token acquisition failed:', error);
            throw error;
        }
    }

    static async refreshToken(refreshToken) {
        const refreshRequest = {
            refreshToken,
            scopes: [
                'https://graph.microsoft.com/OnlineMeetingTranscript.Read.All',
                'https://graph.microsoft.com/OnlineMeeting.Read.All',
                'https://graph.microsoft.com/User.Read'
            ],
        };

        try {
            const response = await cca.acquireTokenByRefreshToken(refreshRequest);
            return response;
        } catch (error) {
            console.error('Token refresh failed:', error);
            throw error;
        }
    }
}

module.exports = AuthService;