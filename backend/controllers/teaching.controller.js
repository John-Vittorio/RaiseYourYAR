import mongoose from "mongoose";

let postedValue = "";

export const getTeaching = async (req, res) => {
    res.send(postedValue);
}

export const postTeaching = async (req, res) => {
    postedValue = req.body;
}