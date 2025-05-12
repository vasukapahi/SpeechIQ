import os
import uuid
import torch
import librosa
import soundfile as sf
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from transformers import Wav2Vec2Processor, Wav2Vec2Model
from model import CNN_GRU_Model, extract_features_from_audio, idx2label, label2idx

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://v0-next-js-dashboard-beta-ochre.vercel.app/"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load model and processor
processor = Wav2Vec2Processor.from_pretrained("facebook/wav2vec2-base-960h")
wav2vec_model = Wav2Vec2Model.from_pretrained("facebook/wav2vec2-base-960h").to(device).eval()
# Load intent labels from CSV
label2idx = {'change language_none_none': 0,
 'activate_music_none': 1,
 'activate_lights_none': 2,
 'deactivate_lights_none': 3,
 'increase_volume_none': 4,
 'decrease_volume_none': 5,
 'increase_heat_none': 6,
 'decrease_heat_none': 7,
 'deactivate_music_none': 8,
 'activate_lamp_none': 9,
 'deactivate_lamp_none': 10,
 'activate_lights_kitchen': 11,
 'activate_lights_bedroom': 12,
 'activate_lights_washroom': 13,
 'deactivate_lights_kitchen': 14,
 'deactivate_lights_bedroom': 15,
 'deactivate_lights_washroom': 16,
 'increase_heat_kitchen': 17,
 'increase_heat_bedroom': 18,
 'increase_heat_washroom': 19,
 'decrease_heat_kitchen': 20,
 'decrease_heat_bedroom': 21,
 'decrease_heat_washroom': 22,
 'bring_newspaper_none': 23,
 'bring_juice_none': 24,
 'bring_socks_none': 25,
 'change language_Chinese_none': 26,
 'change language_Korean_none': 27,
 'change language_English_none': 28,
 'change language_German_none': 29,
 'bring_shoes_none': 30}
idx2label = {0: 'change language_none_none',
 1: 'activate_music_none',
 2: 'activate_lights_none',
 3: 'deactivate_lights_none',
 4: 'increase_volume_none',
 5: 'decrease_volume_none',
 6: 'increase_heat_none',
 7: 'decrease_heat_none',
 8: 'deactivate_music_none',
 9: 'activate_lamp_none',
 10: 'deactivate_lamp_none',
 11: 'activate_lights_kitchen',
 12: 'activate_lights_bedroom',
 13: 'activate_lights_washroom',
 14: 'deactivate_lights_kitchen',
 15: 'deactivate_lights_bedroom',
 16: 'deactivate_lights_washroom',
 17: 'increase_heat_kitchen',
 18: 'increase_heat_bedroom',
 19: 'increase_heat_washroom',
 20: 'decrease_heat_kitchen',
 21: 'decrease_heat_bedroom',
 22: 'decrease_heat_washroom',
 23: 'bring_newspaper_none',
 24: 'bring_juice_none',
 25: 'bring_socks_none',
 26: 'change language_Chinese_none',
 27: 'change language_Korean_none',
 28: 'change language_English_none',
 29: 'change language_German_none',
 30: 'bring_shoes_none'}

input_dim = 768
num_classes = len(label2idx)
model = CNN_GRU_Model(input_dim=input_dim, num_classes=num_classes).to(device)
model.load_state_dict(torch.load("best_cnn_gru_model_2.pt", map_location=device))
model.eval()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/predict-intent/")
async def predict_intent_endpoint(file: UploadFile = File(...)):
    try:
        # Save uploaded file
        file_id = str(uuid.uuid4())
        file_path = os.path.join(UPLOAD_DIR, f"{file_id}.wav")
        with open(file_path, "wb") as f:
            f.write(await file.read())

        # Extract features
        features, length = extract_features_from_audio(file_path, processor, wav2vec_model, device)
        features = features.unsqueeze(0).to(device)
        lengths = torch.tensor([length]).to(device)

        # Predict
        with torch.no_grad():
            logits = model(features, lengths)
            pred_idx = logits.argmax(dim=1).item()
            intent = idx2label[pred_idx]
            print(intent)
        return JSONResponse(content={"intent": intent})

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

