# SpeechIQ — Speaker Intent Recognition with Wav2Vec2 and Deep Learning

**SpeechIQ** is a speaker intent recognition system built using the Fluent Speech Commands (FSC) dataset.  
It explores both traditional and modern audio feature extraction techniques such as MFCCs and Wav2Vec2 embeddings, combined with a deep learning architecture based on CNN-BiGRU, to classify spoken utterances into intent categories.

---

## Overview

- **Task**: Classify spoken commands into one of 31 intent classes
- **Dataset**: [Fluent Speech Commands (FSC)](https://fluent.ai/research/fluent-speech-commands/) — 30,000+ utterances
- **Models**:
  - MFCC + CNN-BiGRU
  - Wav2Vec2 + CNN-BiGRU (achieved 95.5% validation accuracy)
- Comparison of traditional MFCC pipeline with modern pretrained Wav2Vec2 embeddings

---

## Features

- Audio preprocessing using Librosa and Soundfile
- Feature extraction using MFCC and Wav2Vec2 (via Hugging Face Transformers)
- Deep learning model with hybrid CNN-BiGRU architecture
- Model training and evaluation using PyTorch and scikit-learn
- Optional notebook for live testing/inference

---

## Dataset

**Fluent Speech Commands (FSC)**

- Contains over 30,000 utterances by native English speakers
- Covers 31 intent classes (e.g., `activate lights`, `increase temperature`)
- Audio format: `.wav`, 16 kHz, single-channel

Download link: [Fluent Speech Commands Dataset](https://fluent.ai/research/fluent-speech-commands/)


## Getting Started

Follow the steps below to set up and run the project locally:

1. **Clone the Repository:**

```bash
git clone https://github.com/vasukapahi/SpeechIQ
cd SpeechIQ
---
2. **Install Dependencies:**

```bash
pip install -r requirements.txt

---