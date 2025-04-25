import mongoose from 'mongoose';

let postedValue = "";

export const getResearch = async (req, res) => {
    res.send(postedValue);
}

export const postResearch = async (req, res) => {
    postedValue = req.body;
}