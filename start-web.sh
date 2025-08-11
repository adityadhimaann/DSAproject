#!/bin/bash

echo "🚀 Starting Library Management System Web Server..."
echo "📚 Compiling Java files..."

# Compile all Java files
javac *.java

if [ $? -eq 0 ]; then
    echo "✅ Compilation successful!"
    echo "🌐 Starting web server..."
    
    # Start the web server
    java LibraryWebServer
else
    echo "❌ Compilation failed!"
    exit 1
fi
