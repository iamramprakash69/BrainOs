# 🚀 How to Deploy Second Brain OS

We've removed SQLite because serverless platforms (like Vercel) cannot run local database files. The codebase is now configured to use **PostgreSQL**.

Follow these exact steps to get your app live on the internet for free.

---

### Step 1: Create a Free Cloud Database (Neon)
1. Go to [neon.tech](https://neon.tech) and sign up for a free account.
2. Create a new project (name it `second-brain-os`).
3. Once created, you will see a **Connection String** that looks like this:
   `postgresql://username:password@ep-cool-snow-1234.us-east-1.aws.neon.tech/neondb?sslmode=require`
4. Copy this exact string. Keep it safe.

---

### Step 2: Push your Schema to the New Database
Now we need to create the tables in your new Neon database. Run this command in your terminal, replacing `YOUR_NEON_URL` with the connection string you just copied:

```bash
DATABASE_URL="YOUR_NEON_URL" npx prisma db push
```

*This will connect to Neon and instantly create all your user, task, and shame tables.*

---

### Step 3: Deploy to Vercel
I have already installed the Vercel CLI and created the `vercel.json` config for you.

1. In your terminal, run the Vercel login command:
   ```bash
   npx vercel login
   ```
   *Follow the prompt to log in via your browser.*

2. Start the deployment:
   ```bash
   npx vercel
   ```
   * It will ask you a few questions:
     - **Set up and deploy?** → Yes (`y`)
     - **Which scope?** → Press Enter
     - **Link to existing project?** → No (`N`)
     - **What's your project's name?** → Press Enter (or type `kinetic-os`)
     - **In which directory?** → Press Enter

3. **CRITICAL STEP:** Add your Database URL to Vercel so the production app can connect to it. Run:
   ```bash
   npx vercel env add DATABASE_URL
   ```
   - Paste your Neon connection string when prompted.
   - Select **Production**, **Preview**, and **Development** spaces.

4. Push the final production build:
   ```bash
   npx vercel --prod
   ```

🎉 **That's it!** Vercel will give you a live URL where your app is hosted. You can share this link in your hackathon submission.
