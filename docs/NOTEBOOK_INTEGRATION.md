# Notebook Integration Rules

The notebooks are the source of truth.

Do not redesign preprocessing.

Do not rewrite feature engineering.

Do not modify model loading.

Do not change label mappings.

Do not retrain models.

The objective is ONLY to extract reusable inference code from each notebook.

Each notebook should be converted into production-ready Python services.

Training code should remain inside notebooks.

Only inference code should be migrated.
