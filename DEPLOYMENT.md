# Deployment Guide for Vercel

## 1. Prerequisites

- A [Vercel Account](https://vercel.com/)
- A [MongoDB Atlas](https://www.mongodb.com/atlas) Account (or any cloud MongoDB provider)

## 2. Environment Variables

When deploying to Vercel, you **MUST** set the following Environment Variables in the Vercel Project Settings:

- **`MONGODB_URI`**: Your connection string to MongoDB Atlas.
  - Example: `mongodb+srv://user:password@cluster0.abcde.mongodb.net/hotelapp?retryWrites=true&w=majority`
  - **Important**: Do NOT use `localhost` or `127.0.0.1`. You must use a cloud database.

## 3. Important Limitations

### ⚠️ File Uploads
This project currently uses **Local File System** storage (`public/uploads`) for image uploads.
- **On Vercel (Serverless)**: Local file uploads **WILL NOT PERSIST**. Files uploaded will disappear immediately or after a short time.
- **Recommendation**: For the deployed version, please use the **"Image URL"** option when adding products.
- **Future Fix**: To support file uploads in production, integrate a cloud storage service like AWS S3, Vercel Blob, or Cloudinary.

## 4. Admin Credentials

After deployment, the default Master Admin credentials (if you ran the seed script or updated them) are:
- **Role**: `master`
- **Password**: `peterparker` (as configured recently)

Navigate to `/admin/settings` to check or update other role passwords.

## 5. Deployment Steps

1.  Push your code to **GitHub**.
2.  Log in to **Vercel** and click **"Add New..."** -> **"Project"**.
3.  Import your GitHub repository.
4.  In the **"Configure Project"** screen:
    - Open **"Environment Variables"**
    - Add `MONGODB_URI` with your Atlas connection string.
5.  Click **"Deploy"**.

Your app should be live in a few minutes!
