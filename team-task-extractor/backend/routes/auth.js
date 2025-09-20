const express = require('express');
const jwt = require('jsonwebtoken');
const AuthService = require('../services/authService');
const GraphService = require('../services/graphService');
const { saveUser } = require('../database/userService');

const router = express.Router();

// Get auth URL
router.get('/url', async (req, res) => {
    try {
        const authUrl = await AuthService.getAuthUrl();
        res.json({ authUrl });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Handle auth callback
router.post('/callback', async (req, res) => {
    const { code } = req.body;
    
    try {
        // Get tokens from Microsoft
        const tokenResponse = await AuthService.getTokenByCode(code);
        
        // Get user profile
        const graphService = new GraphService(tokenResponse.accessToken);
        const userProfile = await graphService.getUserProfile();
        
        // Save user to database
        await saveUser({
            id: userProfile.id,
            email: userProfile.mail || userProfile.userPrincipalName,
            name: userProfile.displayName,
            accessToken: tokenResponse.accessToken,
            refreshToken: tokenResponse.refreshToken
        });
        
        // Create JWT for frontend
        const jwtToken = jwt.sign(
            { userId: userProfile.id, email: userProfile.mail },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({ 
            token: jwtToken,
            user: {
                id: userProfile.id,
                name: userProfile.displayName,
                email: userProfile.mail || userProfile.userPrincipalName
            }
        });
    } catch (error) {
        console.error('Auth callback error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;