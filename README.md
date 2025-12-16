# Email-EU-Core Graph Analytics Platform

## Overview

This project is an **end-to-end Graph Data Science & Machine Learning platform** built on the **Email-EU-Core network** from the SNAP Stanford repository. It analyzes organizational email communications to **predict department membership**, **perform link prediction**, and **explore community structures** using modern **Graph ML techniques**.

Beyond a classical data science notebook, this project is transformed into a **full-stack web application** aimed at **data scientists, researchers, and organizational analysts**.

---

##  Objectives

* Analyze structural properties of an organizational email network
* Predict the **department of each individual (node classification)**
* Predict potential communication links (**link prediction**)
* Learn meaningful node representations using **graph embeddings (Node2Vec)**
* Compare supervised and unsupervised graph learning approaches
* Provide an **interactive web interface** to explore results and insights

---

##  Dataset

**Source:** SNAP – Stanford Network Analysis Project
**Dataset:** Email-EU-Core Network
**Link:** [https://snap.stanford.edu/data/email-Eu-core.html](https://snap.stanford.edu/data/email-Eu-core.html)

### Dataset Statistics

| Property                   | Value  |
| -------------------------- | ------ |
| Nodes                      | 1,005  |
| Edges                      | 25,571 |
| Departments                | 42     |
| Directed Graph             | Yes    |
| Avg Clustering Coefficient | 0.399  |
| Diameter                   | 7      |

Each node belongs to **exactly one department**, providing ground-truth labels for supervised learning.

---

##  Project Architecture

```
Frontend (Next.js + Tailwind)
        |
        v
Backend API (NestJS)
        |
        v
ML Service (FastAPI)
        |
        v
Graph ML Models (Node2Vec, Clustering, Link Prediction)
```

---

##  Repository Structure

```
email-eu-graph-platform/
│
├── data/                   # Raw & processed datasets
├── ml/                     # Graph ML & experiments
│   ├── eda/
│   ├── features/
│   ├── embeddings/
│   ├── models/
│   └── evaluation/
│
├── ml_service/              # FastAPI ML inference service
│
├── backend/                 # NestJS API
│
├── frontend/                # Next.js web application
│
├── docker/                  # Docker & deployment configs
│
├── report/                  # Final report & figures
│
└── README.md
```

---

##  Phase 1 – Exploratory Graph Analysis

* Degree distribution (in/out)
* Strongly & weakly connected components
* Clustering coefficient analysis
* Inter-department communication matrix
* Small-world & densification analysis

 **Deliverables**

* EDA notebooks
* Visualizations used in the web dashboard

---

##  Phase 2 – Classical ML Baselines

### Features

* In-degree / Out-degree
* PageRank
* Betweenness & Closeness centrality
* Local clustering coefficient
* Neighbor department entropy

### Models

* Logistic Regression
* Random Forest (baseline comparison)

### Metrics

* Macro F1-score
* Top-k accuracy

---

##  Phase 3 – Graph Embeddings (Node2Vec)

### Techniques

* Node2Vec random walks
* Skip-gram embedding learning

### Experiments

* Embedding dimensions: 64 / 128 / 256
* BFS vs DFS exploration (p/q tuning)

### Tasks

* Node classification on embeddings
* Embedding-based similarity analysis

---

##  Phase 4 – Link Prediction

### Features

* Common Neighbors
* Adamic-Adar
* Jaccard Coefficient
* Preferential Attachment
* Cosine similarity of Node2Vec embeddings

### Evaluation

* ROC-AUC
* Precision@k

---

##  Phase 5 – Unsupervised Learning

* Louvain & Leiden community detection
* KMeans on embeddings
* Comparison with ground-truth departments

### Metrics

* Normalized Mutual Information (NMI)
* Adjusted Rand Index (ARI)

---

##  Web Application Features

### Dashboard

* Network statistics
* Degree & department distributions

### Interactive Graph Explorer

* Zoomable network visualization
* Department-based filtering
* Node inspection panel

### ML Capabilities

* Department prediction for a node
* Link prediction between two nodes
* Embedding visualization (UMAP / t-SNE)

### Explainability

* Neighbor-based explanations
* Feature importance analysis
* Similar-node discovery

---

##  Tech Stack

### Machine Learning

* Python
* NetworkX / igraph
* Node2Vec
* scikit-learn
* UMAP

### Backend

* FastAPI (ML service)
* NestJS (API & orchestration)

### Frontend

* Next.js
* Tailwind CSS
* Cytoscape.js
* Chart.js / Recharts

### DevOps

* Docker
* REST APIs

---

##  System Requirements

* CPU: Intel i5 or equivalent
* RAM: 8 GB (sufficient)
* OS: Linux / Windows / macOS

This project is optimized for **small-to-medium graphs** and runs efficiently on personal machines.

---

##  Professional & Academic Value

This project demonstrates:

* Advanced **Graph Machine Learning**
* End-to-end **ML system design**
* **Production-ready ML deployment**
* Interactive **data storytelling**

It is suitable for:

* Final-year engineering projects
* AI / Data Science portfolios
* Research experimentation
* Professional graph analytics demos

---

## Future Extensions

* Temporal graph analysis
* Graph Neural Networks (GCN, GraphSAGE)
* Semi-supervised learning
* Scalability to million-node graphs
* Role-based access for organizations

---

##  References

* Jure Leskovec et al., SNAP Datasets
* Hao Yin et al., *Local Higher-order Graph Clustering*, KDD 2017
* Node2Vec: Grover & Leskovec, KDD 2016

---

##  Author

Developed as an advanced **Graph Data Science & ML engineering project**.

If you find this project useful or inspiring, feel free to build upon it or reach out.
