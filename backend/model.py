import torch
import torch.nn as nn
import librosa
import pandas as pd

class CNN_GRU_Model(nn.Module):
    def __init__(self, input_dim, num_classes):
        super().__init__()
        self.cnn = nn.Sequential(
            nn.Conv1d(input_dim, 256, kernel_size=5, padding=2),
            nn.ReLU(),
            nn.BatchNorm1d(256),
            nn.Conv1d(256, 128, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.BatchNorm1d(128)
        )
        self.gru = nn.GRU(128, 128, batch_first=True, bidirectional=True)
        self.classifier = nn.Linear(128*2, num_classes)

    def forward(self, x, lengths):
        x = x.transpose(1, 2)
        x = self.cnn(x)
        x = x.transpose(1, 2)
        packed = nn.utils.rnn.pack_padded_sequence(x, lengths.cpu(), batch_first=True, enforce_sorted=False)
        packed_out, _ = self.gru(packed)
        out, _ = nn.utils.rnn.pad_packed_sequence(packed_out, batch_first=True)
        last_outputs = out[torch.arange(out.size(0)), lengths - 1]
        return self.classifier(last_outputs)

def extract_features_from_audio(audio_path, processor, wav2vec_model, device):
    audio, _ = librosa.load(audio_path, sr=16000)
    inputs = processor(audio, sampling_rate=16000, return_tensors="pt", padding=True)
    with torch.no_grad():
        features = wav2vec_model(inputs.input_values.to(device)).last_hidden_state.squeeze(0)
    return features.cpu(), features.shape[0]

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
