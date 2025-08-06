# Manual Environment Setup Guide

If the automated setup scripts are not working, follow these manual steps:

## 1. Create .env file manually

Create a new file called `.env` in your account-service directory (same level as `pom.xml`):

### Linux/macOS:
```bash
touch .env
nano .env  # or vim .env
```

### Windows:
```cmd
notepad .env
```

## 2. Add the following content to your .env file:

```bash
# MongoDB Configuration
# Replace with your MongoDB connection string
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/database_name
# For Local MongoDB: mongodb://localhost:27017/database_name
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/banking_accounts

# Application Environment
SPRING_PROFILES_ACTIVE=dev

# Security (Optional - for future enhancements)
# JWT_SECRET=your_jwt_secret_key_here
# API_KEY=your_api_key_here
```

## 3. Update MongoDB Connection String

Replace `your_username`, `your_password`, and `your_cluster` with your actual MongoDB details.

### For MongoDB Atlas:
1. Go to your MongoDB Atlas dashboard
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your actual password
6. Replace `<dbname>` with `banking_accounts`

### For Local MongoDB:
Use: `MONGODB_URI=mongodb://localhost:27017/banking_accounts`

## 4. Load Environment Variables

### Linux/macOS (Bash):
```bash
export $(grep -v '^#' .env | xargs)
```

### Linux/macOS (Fish shell):
```bash
export (grep -v '^#' .env | string replace = ' ')
```

### Windows (Command Prompt):
```cmd
for /f "delims=" %i in (.env) do set %i
```

### Windows (PowerShell):
```powershell
Get-Content .env | ForEach-Object { $name, $value = $_.split('='); [Environment]::SetEnvironmentVariable($name, $value) }
```

## 5. Verify Setup

Check if the environment variable is loaded:

### Linux/macOS:
```bash
echo $MONGODB_URI
```

### Windows (Command Prompt):
```cmd
echo %MONGODB_URI%
```

### Windows (PowerShell):
```powershell
echo $env:MONGODB_URI
```

## 6. Run the Application

```bash
mvn clean install
mvn spring-boot:run
```

## Troubleshooting

### Common Issues:

1. **File not found errors**: Make sure you're in the correct directory (account-service folder)
2. **Permission denied**: On Linux/macOS, make sure the .env file is readable: `chmod 644 .env`
3. **Environment variables not loading**: Try restarting your terminal/command prompt
4. **MongoDB connection issues**: Verify your connection string and network access

### Directory Structure Check:
Your directory should look like this:
```
account-service/
├── src/
├── pom.xml
├── .env                 ← Your environment file
├── .env.example         ← Template file
├── README.md
└── ...
```

### Still Having Issues?

1. Check if you're in the right directory: `pwd` (Linux/macOS) or `cd` (Windows)
2. List files to see if .env exists: `ls -la` (Linux/macOS) or `dir` (Windows)
3. Verify .env file content: `cat .env` (Linux/macOS) or `type .env` (Windows)

## Alternative: IDE Setup

Most IDEs can load environment variables from .env files:

### IntelliJ IDEA:
1. Install the "EnvFile" plugin
2. In Run Configuration, add your .env file
3. Run the application from IDE

### Visual Studio Code:
1. Install the "DotENV" extension
2. Create launch.json with envFile parameter
3. Run using the debugger