
# Email-EU-Core: Trained Models & Results
**Training Date:** 2025-12-17 14:40:01

## 🎯 Model Performance Summary

### Best Model: Logistic Regression
- **Test Accuracy:** 0.7703
- **Test F1-Score:** 0.7556
- **Test Precision:** 0.7624
- **Test Recall:** 0.7703

### All Models Tested
              Model  Train Acc  Val Acc  Test Acc  Test Precision  Test Recall  Test F1
Logistic Regression     1.0000   0.7432    0.7703          0.7624       0.7703   0.7556
      Random Forest     1.0000   0.6351    0.7095          0.6656       0.7095   0.6643
                SVM     0.9724   0.7230    0.7500          0.7854       0.7500   0.7462
  Gradient Boosting     1.0000   0.4932    0.6014          0.6427       0.6014   0.6004

## 📦 Files Included

### 1. Models
- **node2vec_model.wv** - Trained Node2Vec embeddings (for generating new node embeddings)
- **best_classifier.pkl** - Best performing classifier (Logistic Regression + StandardScaler)

### 2. Data
- **X_embeddings.npy** - Full embedding matrix (shape: (984, 128))
- **y_labels.npy** - Department labels (shape: (984,))
- **node_ids.npy** - Node IDs for tracking

### 3. Train/Val/Test Splits
- **X_train.npy, y_train.npy** - Training set (688 samples)
- **X_val.npy, y_val.npy** - Validation set (148 samples)
- **X_test.npy, y_test.npy** - Test set (148 samples)

### 4. Results & Metadata
- **model_comparison.csv** - Performance of all tested models
- **metadata.json** - Complete training configuration and statistics
- **README.txt** - This file

## 🔧 Data Statistics
- **Total Samples:** 984
- **Embedding Dimension:** 128
- **Number of Departments:** 40
- **Graph Nodes:** 984
- **Embedding Coverage:** 100.00%

## 🚀 How to Use

### Load Node2Vec Model (for new embeddings)
```python
from gensim.models import KeyedVectors

# Load Node2Vec model
embeddings = KeyedVectors.load('node2vec_model.wv')

# Get embedding for a specific node
node_embedding = embeddings.wv['node_id']

# Find similar nodes
similar_nodes = embeddings.wv.most_similar('node_id', topn=10)
```

### Load Best Classifier (for predictions)
```python
import pickle
import numpy as np

# Load the trained classifier
with open('best_classifier.pkl', 'rb') as f:
    classifier = pickle.load(f)

# Load test data
X_test = np.load('X_test.npy')
y_test = np.load('y_test.npy')

# Make predictions
predictions = classifier.predict(X_test)

# Get prediction probabilities (if supported)
if hasattr(classifier, 'predict_proba'):
    probabilities = classifier.predict_proba(X_test)

# Evaluate
from sklearn.metrics import accuracy_score, classification_report
print(f"Accuracy: {accuracy_score(y_test, predictions):.4f}")
print(classification_report(y_test, predictions))
```

### Load Full Dataset
```python
import numpy as np
import json

# Load embeddings
X = np.load('X_embeddings.npy')
y = np.load('y_labels.npy')
node_ids = np.load('node_ids.npy')

# Load metadata
with open('metadata.json', 'r') as f:
    metadata = json.load(f)

print(f"X shape: {X.shape}")
print(f"Best model: {metadata['best_model']['name']}")
print(f"Test accuracy: {metadata['best_model']['test_accuracy']:.4f}")
```

### Load Specific Split
```python
import numpy as np

# Load training data
X_train = np.load('X_train.npy')
y_train = np.load('y_train.npy')

# Load validation data
X_val = np.load('X_val.npy')
y_val = np.load('y_val.npy')

# Load test data
X_test = np.load('X_test.npy')
y_test = np.load('y_test.npy')
```

## 📊 Node2Vec Hyperparameters
- **Dimensions:** 128
- **Walk Length:** 80
- **Number of Walks:** 10
- **Window Size:** 10
- **Epochs:** 20
- **p (Return parameter):** 1
- **q (In-out parameter):** 1

## 📁 Recommended Directory Structure
```
email-eu-graph-platform/
├── models/
│   ├── node2vec_model.wv           # Node2Vec embeddings
│   ├── best_classifier.pkl         # Best trained classifier
│   ├── X_embeddings.npy            # Full embeddings
│   ├── y_labels.npy                # Labels
│   ├── node_ids.npy                # Node tracking
│   ├── X_train.npy, y_train.npy   # Training split
│   ├── X_val.npy, y_val.npy       # Validation split
│   ├── X_test.npy, y_test.npy     # Test split
│   ├── model_comparison.csv        # All models performance
│   ├── metadata.json               # Training metadata
│   └── README.txt                  # This file
```

## 🎓 Next Steps

1. **Production Deployment**
   - Use `best_classifier.pkl` for real-time predictions
   - Load Node2Vec model to generate embeddings for new nodes

2. **Model Improvement**
   - Try different Node2Vec parameters (p, q values)
   - Experiment with ensemble methods
   - Feature engineering on embeddings

3. **Analysis**
   - Visualize embeddings (PCA, t-SNE, UMAP)
   - Analyze misclassifications
   - Study department relationships

4. **Monitoring**
   - Track prediction accuracy over time
   - Update model periodically with new data

## ⚠️ Important Notes
- The classifier expects **scaled** input (StandardScaler is included in pipeline)
- Node IDs are stored as strings in the Node2Vec model
- All departments have at least 7 samples (filtered during preprocessing)

---
Generated by: Email-EU-Core Classification Pipeline
Training completed: 2025-12-17 14:40:01
