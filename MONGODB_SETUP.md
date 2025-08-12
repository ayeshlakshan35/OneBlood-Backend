# MongoDB Connection Setup Guide

## Current Issue
Your backend is failing to connect to MongoDB because the `MONGO_URI` is missing from your `.env` file.

## Solutions

### Option 1: Use MongoDB Atlas (Recommended)

1. **Create a MongoDB Atlas account** (free tier available):
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for a free account
   - Create a new cluster

2. **Get your connection string**:
   - In Atlas dashboard, click "Connect"
   - Choose "Connect your application"
   - Copy the connection string

3. **Update your .env file**:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority
   JWT_SECRET=your_secret_key_here
   CLIENT_ORIGIN=http://localhost:5173
   ```

4. **Whitelist your IP**:
   - In Atlas dashboard, go to Network Access
   - Add your current IP address to the whitelist
   - Or temporarily allow access from anywhere (0.0.0.0/0) for development

### Option 2: Use Local MongoDB

1. **Install MongoDB locally**:
   - Download from [MongoDB Community Server](https://www.mongodb.com/try/download/community)
   - Install and start the MongoDB service

2. **Update your .env file**:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/oneblood
   JWT_SECRET=your_secret_key_here
   CLIENT_ORIGIN=http://localhost:5173
   ```

### Option 3: Use MongoDB Memory Server (For Testing)

1. **Install the package**:
   ```bash
   npm install mongodb-memory-server
   ```

2. **Create a test configuration** (for development only)

## Current .env File Status
Your current `.env` file only contains:
```
PORT=5000
```

You need to add:
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

## Quick Fix for Testing
If you want to test the API without database connection temporarily, you can modify the Server.js to start without MongoDB:

```javascript
// Comment out the MongoDB connection temporarily
// mongoose.connect(MONGO_URI)...
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
```

## Next Steps
1. Choose one of the MongoDB setup options above
2. Update your `.env` file with the correct `MONGO_URI`
3. Restart your server
4. Test the connection

The reject functionality I implemented will work once the database connection is established!
