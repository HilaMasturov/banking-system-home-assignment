@echo off
REM Setup Environment Variables for Banking System - Account Service (Windows)

echo 🏦 Setting up Banking System Account Service environment...

REM Debug: Show current directory and list files
echo 📁 Current directory: %CD%
echo 📋 Files in current directory:
dir /b *.env* 2>nul || echo    No .env files found

REM Check if .env file exists
if not exist .env (
    echo ❌ .env file not found!
    echo 📝 Creating .env file from template...

    REM Check multiple possible locations for .env.example
    if exist .env.example (
        copy .env.example .env >nul
        echo ✅ Created .env file from .env.example
    ) else if exist ..\.env.example (
        copy ..\.env.example .env >nul
        echo ✅ Created .env file from ..\.env.example
    ) else if exist account-service\.env.example (
        copy account-service\.env.example .env >nul
        echo ✅ Created .env file from account-service\.env.example
    ) else (
        echo ❌ .env.example file not found in current, parent, or account-service directory!
        echo 📝 Creating .env file manually...

        (
        echo # MongoDB Configuration
        echo # Replace with your MongoDB connection string
        echo # For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/database_name
        echo # For Local MongoDB: mongodb://localhost:27017/database_name
        echo MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/banking_accounts
        echo.
        echo # Application Environment
        echo SPRING_PROFILES_ACTIVE=dev
        echo.
        echo # Security ^(Optional - for future enhancements^)
        echo # JWT_SECRET=your_jwt_secret_key_here
        echo # API_KEY=your_api_key_here
        ) > .env

        echo ✅ Created .env file with default template
    )

    echo ⚠️  Please edit .env file with your MongoDB connection details
    echo.
    echo To edit the .env file, use notepad or your preferred editor:
    echo   notepad .env
    echo.
    echo Required: Update MONGODB_URI with your connection string
    pause
) else (
    echo ✅ Found existing .env file
)

echo 🔧 Loading environment variables...

REM Load environment variables from .env file
for /f "usebackq delims=" %%i in (".env") do (
    REM Skip lines that start with # or are empty
    echo %%i | findstr /r "^#.*" >nul
    if errorlevel 1 (
        echo %%i | findstr /r "^$" >nul
        if errorlevel 1 (
            set %%i
        )
    )
)

echo ✅ Environment variables loaded

REM Verify MONGODB_URI is set
if "%MONGODB_URI%"=="" (
    echo ⚠️  Warning: MONGODB_URI is not set in .env file
    echo    Please update .env with your MongoDB connection string
) else (
    echo ✅ MONGODB_URI is configured
)

echo.
echo 🚀 Environment setup complete!
echo.
echo Next steps:
echo 1. Verify your MongoDB connection string in .env
echo 2. Run: mvn clean install
echo 3. Run: mvn spring-boot:run
echo 4. Open: http://localhost:8081/swagger-ui.html
echo.

pause