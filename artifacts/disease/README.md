# Module A — Disease Detection Artifacts

Upload exported artifacts from `training/ModeuleA_CropDiseaseDetection_Thesis_Implementation_BhargavaKoya_20075511.ipynb` into this directory.

## Required Files (Inference)

| File | Format | Purpose |
|------|--------|---------|
| `custom.keras` | Keras | Custom CNN model weights |
| `efficientnet.keras` | Keras | EfficientNetB0 model weights |
| `resnet.keras` | Keras | ResNet50 model weights |
| `vgg16.keras` | Keras | VGG16 model weights |
| `class_names.json` | JSON | Index → class label mapping (alphabetical order) |
| `image_config.json` | JSON | Per-model `{height, width, preprocess_mode}` |
| `metrics.json` | JSON | Benchmark results and `active_model` selection |

## Optional Files (Evaluation / UI)

| File | Format | Purpose |
|------|--------|---------|
| `benchmark.png` | PNG | Model comparison chart |

## Preprocess Modes (`image_config.json`)

| Mode | Models | Transform |
|------|--------|-----------|
| `rescale` | Custom CNN (150×150) | Divide by 255 |
| `none` | EfficientNetB0 (224×224) | No rescale |
| `resnet` | ResNet50 (224×224) | `resnet50.preprocess_input` |
| `vgg` | VGG16 (224×224) | `vgg16.preprocess_input` |

## Class Labels

Expected classes (alphabetical index order):

0. Apple Scab
1. Black Rot
2. Cedar Apple Rust
3. Healthy

## Upload Instructions

1. Run the Module A notebook in Colab and execute the artifact export cells.
2. Download `disease_artifacts.zip` (or copy the `artifacts/disease/` folder).
3. Extract all files into this directory.
4. Verify all 7 required files are present before starting the backend.
