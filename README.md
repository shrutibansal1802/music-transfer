# Spotify to Amazon Music Playlist Transfer

This application allows you to transfer your playlists from Spotify to Amazon Music seamlessly. The app uses Spotify's Web API and Amazon Music's Beta API to fetch and recreate your playlists on Amazon Music.

---

## 🚀 Features
- Authenticate with Spotify and Amazon Music accounts.
- Fetch your Spotify playlists and their tracks.
- Create new playlists in Amazon Music with the same tracks.

---

## 🛠 Prerequisites
Before running the application, you need:
1. **Spotify Client ID and Secret**
2. **Amazon ClientID**
3. **Amazon Music API Access**: Your Amazon Developer Account must have access to the Beta APIs for Amazon Music.

---

## ⚙️ Steps to Obtain API Credentials

### **Spotify API Setup**
1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/).
2. Log in with your Spotify account.
3. Click **Create an App**.
   - Fill in the required details like the app name and description.
4. Once the app is created, open its settings and take note of the **Client ID** and **Client Secret**.
5. Set the **Redirect URI** (e.g., `http://localhost:3000/callback`) in the app's settings.

### **Amazon Music API Setup**
1. Visit the [Amazon Developer Portal](https://developer.amazon.com/).
2. Log in or sign up for a developer account.
3. Go to the **Security Profile** section and create a new security profile:
   - Name your app and provide a description.
   - Save and note down the **Client ID** and **Client Secret**.
4. Enable access to **Amazon Music Beta APIs** (I contact Amazon support but didn't get the access, so this app is not tested).
5. Set the **Redirect URI** (e.g., `http://localhost:3000/callback`) in your security profile.

---

## 📝 Installation and Usage

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/spotify-to-amazon-transfer.git
   cd spotify-to-amazon-transfer
    ```
2. Install dependencies:
   ```
   npm install
   ```

3.Create a .env file in the project root and configure the environment variables

4. Start the development server:
```npm start```

5. Open your browser and navigate to http://localhost:3000

**Limitations and Notes**

Amazon Music API Access:
The app will only work if your Amazon Developer Account has access to the Amazon Music Beta APIs.


- This application has not been tested.
- It's not secure to host anywhere, only use for personal usage.
- Use at your own risk and verify the results after each transfer.
