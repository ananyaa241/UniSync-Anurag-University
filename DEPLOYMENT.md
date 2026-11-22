# UniSync CSE - Production Deployment Guide (Render, Vercel & MongoDB Atlas)

This guide provides step-by-step instructions to deploy the **UniSync CSE** platform into production using:
- **MongoDB Atlas** (Cloud Database)
- **Render** (Backend Express + Socket.IO Server)
- **Vercel** (Frontend React + Vite Client)

---

## 1. MongoDB Atlas Setup (Cloud Database)

1. Log in or create a free account at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Create a new project named `UniSync-CSE` and deploy a **M0 (Free)** cluster (choose `AWS` / `ap-south-1 Mumbai` or nearest region).
3. **Database Access**:
   - Go to **Security > Database Access**.
   - Click **Add New Database User**.
   - Authentication Method: **Password**.
   - Set a Username (e.g., `unisync_admin`) and a secure Password.
   - Database User Privileges: **Read and write to any database**.
4. **Network Access**:
   - Go to **Security > Network Access**.
   - Click **Add IP Address**.
   - Select **Allow Access from Anywhere** (`0.0.0.0/0`) so Render instances can connect.
5. **Get Connection String**:
   - Go to **Database > Clusters** and click **Connect**.
   - Choose **Drivers** (Node.js).
   - Copy the connection string format:
     ```
     mongodb+srv://unisync_admin:<password>@cluster0.xxxx.mongodb.net/unisync_db?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your actual password and ensure the database name is `unisync_db`.

---

## 2. Render Setup (Backend Web Service)

1. Log in or sign up at [render.com](https://render.com).
2. Click **New +** > **Web Service**.
3. Connect your GitHub / GitLab repository (`Slack-4-Anurag-University`).
4. Configure the Web Service settings:

| Setting | Value |
| :--- | :--- |
| **Name** | `unisync-backend` (or your preferred name) |
| **Region** | Singapore / Frankfurt / Oregon (nearest to your users) |
| **Branch** | `main` |
| **Root Directory** | *(leave blank for repository root)* |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build --prefix server` |
| **Start Command** | `npm --prefix server start` |
| **Plan** | `Free` |

5. **Environment Variables on Render**:
Under the **Environment** tab on Render, add the following key-value pairs:

| Variable | Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production optimizations |
| `PORT` | `10000` | Port provided by Render (or 5000) |
| `MONGODB_URI` | `mongodb+srv://unisync_admin:...` | Your MongoDB Atlas connection URI |
| `JWT_ACCESS_SECRET` | *(64-char random string)* | E.g., `unisync_prod_access_secret_anurag_cse_2026_super_secure` |
| `JWT_REFRESH_SECRET` | *(64-char random string)* | E.g., `unisync_prod_refresh_secret_anurag_cse_2026_super_secure` |
| `JWT_ACCESS_EXPIRES_IN`| `1h` | Access token lifespan |
| `JWT_REFRESH_EXPIRES_IN`| `30d` | Refresh token lifespan |
| `CLIENT_URL` | `https://<your-app>.vercel.app` | Vercel frontend domain (update after Vercel step) |
| `GROQ_API_KEY` | `gsk_your_groq_api_key_here` | Groq AI Assistant key |

6. Click **Deploy Web Service**.
7. Once deployed, copy your Render URL:
   `https://unisync-backend.onrender.com`

---

## 3. Vercel Setup (Frontend Web Application)

1. Log in to [vercel.com](https://vercel.com) and click **Add New... > Project**.
2. Import the same repository (`Slack-4-Anurag-University`).
3. Configure the Project Settings:

| Setting | Value |
| :--- | :--- |
| **Framework Preset** | `Vite` |
| **Root Directory** | `client` *(Click 'Edit' and select `client`)* |
| **Build Command** | `npm run build` *(or leave default `tsc -b && vite build`)* |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

4. **Environment Variables on Vercel**:
In the **Environment Variables** section, add:

| Variable | Value | Description |
| :--- | :--- | :--- |
| `VITE_API_URL` | `https://unisync-backend.onrender.com` | Your Render backend URL *(no trailing slash)* |

5. Click **Deploy**.
6. Once deployed, Vercel gives you a live domain (e.g. `https://unisync-cse.vercel.app`).

---

## 4. Final Connection Step

1. Copy your Vercel URL (e.g., `https://unisync-cse.vercel.app`).
2. Go back to **Render > unisync-backend > Environment**.
3. Update `CLIENT_URL` with your Vercel URL:
   ```
   CLIENT_URL=https://unisync-cse.vercel.app
   ```
4. Render will automatically redeploy with the updated CORS origin.

---

## 5. Seed Initial Academic Database (Optional)

To seed standard departmental accounts (Dean, Academic Coordinator, Faculty members):
From your local terminal with your MongoDB Atlas URI configured in `server/.env`:
```bash
npm run seed
```
Or run it from Render's Web Shell tab:
```bash
npm --prefix server run seed
```
