npx eslint .

if [ $? -eq 0 ]; then
    node --trace-warnings api.js
else
    echo "ESLint hatalar buldu, Node.js uygulaması bu koşullarda çalışacak."
    sleep 5
    node --trace-warnings api.js
fi
