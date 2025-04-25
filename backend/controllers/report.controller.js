import mongoose from "mongoose"
/* Will need to import Model */

/* Dummy Controller */
/* Hook this up with the database... */
let postedValue = "";

export const getReport = async (req, res) => {
    res.send(postedValue)
}

export const postReport = async (req, res) => {
    postedValue = req.body
}

/* Sign-in Logic */
/*
1. User inputs credentials (Email, Full Name)
2. Database checks if the email, and full name exists (Perhaps adding password functionality)
3. If EXIST -> Resource Redirect
4. If ABSENT -> Try Again Message
*/