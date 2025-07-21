from huggingface_hub import hf_hub_download
import os

# Define the model repository and file
repo_id = "TheBloke/Mixtral-7B-Instruct-v0.1-GGUF"
filename = "mixtral-7b-instruct-v0.1.Q4_K_M.gguf"  # Example: 4-bit quantized model
save_path = "./models"  # Local directory to save the model

# Create directory if it doesn't exist
os.makedirs(save_path, exist_ok=True)

# Download the model
print(f"Downloading {filename} from {repo_id}...")
model_path = hf_hub_download(repo_id=repo_id, filename=filename, local_dir=save_path)
print(f"Model saved to {model_path}")