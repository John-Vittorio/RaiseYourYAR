import fetch from 'node-fetch'; // if using Node < 18
import Faculty from '../models/faculty.model.js';

export const handleOrcidCallback = async (req, res) => {
    const code = req.query.code;
    
    if (!code) {
        return res.status(400).json({ message: "Missing authorization code" }); 
    }
    
    try {
        // Exchange code for access token
        const tokenResponse = await fetch('https://sandbox.orcid.org/oauth/token', { 
            method: 'POST', 
            headers: { 
                'Content-Type': 'application/x-www-form-urlencoded' 
            }, 
            body: new URLSearchParams({ 
                client_id: process.env.ORCID_CLIENT_ID, 
                client_secret: process.env.ORCID_CLIENT_SECRET, 
                grant_type: 'authorization_code',
                code, 
                redirect_uri: 'https://yearlyactivityreport.netlify.app/auth/orcid/callback', 
            }) 
        });
        
        const tokenData = await tokenResponse.json();
        
        if (!tokenData.orcid) {
            return res.status(400).json({ 
                message: "Invalid token exchange", 
                details: tokenData 
            }); 
        }
        
        const { orcid, name, access_token } = tokenData;
        
        // Optionally fetch more user info from ORCID API
        const profileRes = await fetch(`https://pub.sandbox.orcid.org/v3.0/${orcid}`, { 
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${access_token}`, 
            } 
        });
        
        const profile = await profileRes.json();
        const givenName = profile?.person?.name?.["given-names"]?.value;
        const familyName = profile?.person?.name?.["family-name"]?.value;
        
        // Optionally: store/update in your Faculty model
        let faculty = await Faculty.findOne({ orcidId: orcid });
        
        if (!faculty) {
            faculty = await Faculty.create({ 
                orcidId: orcid, 
                firstName: givenName, 
                lastName: familyName,
                // Add more fields as necessary
            }); 
        }
        
        // Optional: issue your own session/token or redirect with info
        res.redirect(`https://yearlyactivityreport.netlify.app/orcid-success?orcid=${orcid}&name=${givenName} ${familyName}`); 
    } catch (error) {
        console.error("ORCID callback error:", error);
        res.status(500).json({ 
            message: "ORCID callback failed", 
            error: error.message 
        }); 
    }
};
