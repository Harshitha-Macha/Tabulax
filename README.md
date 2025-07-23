How to run this?

-download the mistral-7b-instruct-v0.1.Q8_0.gguf model from hugging face (Note that the model is gguf file)

from the project root file

in cmd:

cd frontend > npm run dev ( runs the frontend vite+react app in web )

cd backend > node auth-api.js ( initialises databases for data exchange and also for authentication )

cd backend > python app.py ( runs model and other algorithm used for transformation )
