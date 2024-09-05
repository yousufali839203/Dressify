import axios from "axios";
import path from "path";
import fs from "fs";
import { Client } from "@gradio/client";
import { log } from "util";

// Handle the photo uploads and interaction with Kwai-Kolors/Kolors-Virtual-Try-On API
export const uploadPhotos = async (req, res) => {
  let userPhotoPath;
  let garmentPhotoPath;

  try {
    // Multer stores the uploaded files' information in req.files
    userPhotoPath = req.files["userPhoto"][0].path;
    garmentPhotoPath = req.files["garmentPhoto"][0].path;
    // console.log(req.files);

    // Read the files to send as blobs
    const userPhotoBlob = fs.readFileSync(userPhotoPath);
    const garmentPhotoBlob = fs.readFileSync(garmentPhotoPath);

    // Connect to the Kwai-Kolors API
    const client = await Client.connect("Kwai-Kolors/Kolors-Virtual-Try-On");

    // Send the blobs to the API for virtual try-on
    const result = await client.predict("/tryon", {
      person_img: userPhotoBlob,
      garment_img: garmentPhotoBlob,
      seed: 0,
      randomize_seed: true,
    });

    // console.log(result);

    // Return the response from API
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  } finally {
    // Delete the uploaded files after processing
    try {
      if (userPhotoPath) fs.unlinkSync(userPhotoPath);
      if (garmentPhotoPath) fs.unlinkSync(garmentPhotoPath);
    } catch (unlinkError) {
      console.error("Error deleting files:", unlinkError.message);
    }
  }
};
