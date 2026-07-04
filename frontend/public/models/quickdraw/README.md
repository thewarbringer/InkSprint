# Trained model goes here

This folder is intentionally empty until you've run
`InkSprint_QuickDraw_Trainer.ipynb` in Google Colab.

After training, unzip the notebook's output and drop these files directly
into this folder (no subfolder):

- `model.json`
- `group1-shard1of1.bin` (or however many shard files Colab produced)
- `categories.json`

The frontend (`src/services/ml/quickDrawModel.js`) automatically looks
for `model.json` here. If it's missing, the Game Screen falls back to a
placeholder confidence calculation so the game stays playable while
you're still training.
