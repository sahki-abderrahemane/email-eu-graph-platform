import os
import joblib
import numpy as np
import networkx as nx
import pandas as pd
from gensim.models import KeyedVectors
import logging

# Path setup relative to ml/app/utils/model_manager.py
# __file__ is ml/app/utils/model_manager.py
# d(f) -> ml/app/utils
# d(d(f)) -> ml/app
# d(d(d(f))) -> ml
# d(d(d(d(f)))) -> root (email-eu-graph-platform)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
MODELS_DIR = os.path.join(BASE_DIR, 'models')
TRAINED_MODELS_DIR = os.path.join(MODELS_DIR, 'trained_models_complete')
DATA_DIR = os.path.join(BASE_DIR, 'data')

logger = logging.getLogger(__name__)

print(f"DEBUG: BASE_DIR calculated as {BASE_DIR}")
print(f"DEBUG: MODELS_DIR: {MODELS_DIR}")
print(f"DEBUG: DATA_DIR: {DATA_DIR}")

class ModelManager:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelManager, cls).__new__(cls)
            cls._instance.initialized = False
        return cls._instance

    def __init__(self):
        if hasattr(self, 'initialized') and self.initialized:
            return
            
        self.classifier = None
        self.link_predictor = None
        self.node2vec_model = None
        self.embeddings = None
        self.node_id_map = None
        self.X_test = None
        self.y_test = None
        self.graph = None
        self.labels = None
        self.pagerank = {}
        
        self.load_models()
        self.load_graph()
        self.initialized = True

    def load_models(self):
        try:
            # Load Department Classifier
            clf_path = os.path.join(TRAINED_MODELS_DIR, 'best_classifier.pkl')
            if os.path.exists(clf_path):
                self.classifier = joblib.load(clf_path)
                logger.info(f"Loaded department classifier from {clf_path}")
                print(f"DEBUG: Loaded classifier from {clf_path}")
            else:
                rf_path = os.path.join(MODELS_DIR, 'department_classifier_random_forest.pkl')
                if os.path.exists(rf_path):
                    self.classifier = joblib.load(rf_path)
                    logger.info(f"Loaded department classifier from {rf_path}")
                    print(f"DEBUG: Loaded classifier from {rf_path}")

            lp_path = os.path.join(MODELS_DIR, 'link_predictor_rf.pkl')
            if os.path.exists(lp_path):
                self.link_predictor = joblib.load(lp_path)
                logger.info(f"Loaded link predictor from {lp_path}")
                print(f"DEBUG: Loaded link predictor from {lp_path}")

            emb_path = os.path.join(TRAINED_MODELS_DIR, 'X_embeddings.npy')
            id_path = os.path.join(TRAINED_MODELS_DIR, 'node_ids.npy')
            if os.path.exists(emb_path) and os.path.exists(id_path):
                self.embeddings = np.load(emb_path)
                node_ids = np.load(id_path, allow_pickle=True)
                self.node_id_map = {int(node_id): i for i, node_id in enumerate(node_ids)}
                logger.info(f"Loaded {len(self.embeddings)} embeddings and ID map")
                print(f"DEBUG: Loaded {len(self.embeddings)} embeddings")

            # Load Test Data for Unseen Prediction
            x_test_path = os.path.join(TRAINED_MODELS_DIR, 'X_test.npy')
            y_test_path = os.path.join(TRAINED_MODELS_DIR, 'y_test.npy')
            if os.path.exists(x_test_path) and os.path.exists(y_test_path):
                self.X_test = np.load(x_test_path)
                self.y_test = np.load(y_test_path)
                print(f"DEBUG: Loaded unseen test set with {len(self.X_test)} samples")

            n2v_path = os.path.join(TRAINED_MODELS_DIR, 'node2vec_model.wv')
            if os.path.exists(n2v_path):
                self.node2vec_model = KeyedVectors.load(n2v_path)
                logger.info("Loaded Node2Vec keyed vectors")
                print(f"DEBUG: Loaded Node2Vec model successfully")

        except Exception as e:
            logger.error(f"Error loading models: {str(e)}")
            print(f"DEBUG ERROR in load_models: {str(e)}")

    def load_graph(self):
        try:
            edges_path = os.path.join(DATA_DIR, 'email-Eu-core.csv')
            if os.path.exists(edges_path):
                # Data is space-separated, use \s+
                df = pd.read_csv(edges_path, sep='\s+', header=None, names=['source', 'target'])
                self.graph = nx.from_pandas_edgelist(df, 'source', 'target')
                logger.info(f"Loaded graph with {self.graph.number_of_nodes()} nodes")
                print(f"DEBUG: Loaded graph with {self.graph.number_of_nodes()} nodes")
                self.pagerank = nx.pagerank(self.graph)
                print(f"DEBUG: PageRank computed")
            else:
                print(f"DEBUG WARNING: Edges file not found at {edges_path}")
            
            labels_path = os.path.join(DATA_DIR, 'email-Eu-core-department-labels.csv')
            if os.path.exists(labels_path):
                labels_df = pd.read_csv(labels_path, sep='\s+', header=None, names=['node_id', 'dept'])
                self.labels = labels_df.set_index('node_id')['dept'].to_dict()
                print(f"DEBUG: Loaded {len(self.labels)} labels")
            else:
                print(f"DEBUG WARNING: Labels file not found at {labels_path}")

        except Exception as e:
            logger.error(f"Error loading graph: {str(e)}")
            print(f"DEBUG ERROR in load_graph: {str(e)}")

    def predict_department(self, node_id: int):
        if self.classifier is None:
            return {"error": "Classifier not loaded"}
        if self.node_id_map and node_id in self.node_id_map:
            idx = self.node_id_map[node_id]
            emb = self.embeddings[idx].reshape(1, -1)
            
            pred = self.classifier.predict(emb)[0]
            probs = self.classifier.predict_proba(emb)[0]
            
            top_k_indices = np.argsort(probs)[-5:][::-1]
            top_k = [{"department": int(self.classifier.classes_[i]), "score": float(probs[i])} for i in top_k_indices]
            
            return {
                "node_id": node_id,
                "predicted_department": int(pred),
                "confidence": float(np.max(probs)),
                "top_k_departments": top_k
            }
        else:
            return {"error": f"No embedding found for node {node_id}"}

    def predict_link(self, source: int, target: int):
        if self.link_predictor is None or self.graph is None:
            return {"error": "Link predictor or graph not loaded"}
        
        try:
            common_neighbors = len(list(nx.common_neighbors(self.graph, source, target))) if source in self.graph and target in self.graph else 0
            
            jaccard = 0
            if source in self.graph and target in self.graph:
                jaccard_coeffs = list(nx.jaccard_coefficient(self.graph, [(source, target)]))
                jaccard = jaccard_coeffs[0][2]
                
            pref_attach = 0
            if source in self.graph and target in self.graph:
                pa_coeffs = list(nx.preferential_attachment(self.graph, [(source, target)]))
                pref_attach = pa_coeffs[0][2]
                
            pr_prod = self.pagerank.get(source, 0) * self.pagerank.get(target, 0)
            
            same_dept = 0
            if self.labels and source in self.labels and target in self.labels:
                same_dept = 1 if self.labels[source] == self.labels[target] else 0
                
            degree_diff = abs(self.graph.degree(source) - self.graph.degree(target)) if source in self.graph and target in self.graph else 0
            
            features = np.array([[common_neighbors, jaccard, pref_attach, pr_prod, same_dept, degree_diff]])
            score = self.link_predictor.predict_proba(features)[0][1]
            
            return {
                "source": source,
                "target": target,
                "score": float(score),
                "metrics": {
                    "common_neighbors": int(common_neighbors),
                    "jaccard": float(jaccard),
                    "preferential_attachment": int(pref_attach),
                    "pagerank_product": float(pr_prod),
                    "same_department": int(same_dept),
                    "degree_diff": int(degree_diff)
                }
            }
        except Exception as e:
            return {"error": f"Link prediction failed: {str(e)}"}

    def simulate_link(self, neighbor_ids: list, target: int):
        """Simulate link probability between a new node (with given neighbors) and an existing node"""
        if self.link_predictor is None or self.graph is None:
            return {"error": "Link predictor or graph not loaded"}
        
        try:
            if target not in self.graph:
                return {"error": f"Target node {target} not in the existing graph"}

            # Convert to set for fast lookup and deduplication
            new_node_neighbors = set(int(nid) for nid in neighbor_ids)
            
            # CASE 0: Direct connection already exists in the simulation parameters
            if int(target) in new_node_neighbors:
                return {
                    "source": "Simulation Node",
                    "target": target,
                    "score": 1.0,
                    "is_direct": True,
                    "message": "Direct link specified in neighbor list",
                    "metrics": {
                        "common_neighbors": len(self.graph.adj[target]),
                        "jaccard": 1.0,
                        "preferential_attachment": len(new_node_neighbors) * self.graph.degree(target),
                        "same_department": 1
                    }
                }

            # Calculate topological features for the new hypothetical node
            target_neighbors = set(self.graph.neighbors(target))
            
            common_neighbors = len(new_node_neighbors.intersection(target_neighbors))
            
            # If there are common neighbors, the probability should definitely be non-zero
            # We'll use the model to get the exact score, but we need to ensure features are realistic
            
            union_size = len(new_node_neighbors.union(target_neighbors))
            jaccard = common_neighbors / union_size if union_size > 0 else 0
            
            # Preferential attachment
            pref_attach = len(new_node_neighbors) * self.graph.degree(target)
            
            # Refined PageRank estimation for a new node with 'k' edges
            # PR(new) ≈ (1-d)/N + d * Σ(PR(neighbor)/degree(neighbor))
            d_factor = 0.85
            pr_new = (1 - d_factor) / self.graph.number_of_nodes()
            for nid in new_node_neighbors:
                if nid in self.graph:
                    deg = self.graph.degree(nid)
                    if deg > 0:
                        pr_new += d_factor * (self.pagerank.get(nid, 0) / deg)
            
            pr_prod = pr_new * self.pagerank.get(target, 0)
            
            # Same department (estimate)
            target_dept = self.labels.get(target, -1)
            # Find the most frequent department among neighbors to guess the new node's dept
            neighbor_depts = [self.labels.get(nid) for nid in new_node_neighbors if nid in self.labels]
            if neighbor_depts:
                from collections import Counter
                predicted_new_dept = Counter(neighbor_depts).most_common(1)[0][0]
                same_dept = 1 if target_dept == predicted_new_dept else 0
            else:
                same_dept = 0
            
            degree_diff = abs(len(new_node_neighbors) - self.graph.degree(target))
            
            features = np.array([[common_neighbors, jaccard, pref_attach, pr_prod, same_dept, degree_diff]])
            score = self.link_predictor.predict_proba(features)[0][1]
            
            # Logic smoothing: if common neighbors exist, ensure a baseline floor probability 
            # as the RF might be too conservative for synthetic 1-degree nodes
            if common_neighbors > 0 and score < 0.05:
                # Give a small boost if common neighbors exist but score is near zero
                score = max(score, 0.05 + (0.02 * common_neighbors))
            
            return {
                "source": "Simulation Node",
                "target": target,
                "score": float(score),
                "is_direct": False,
                "metrics": {
                    "common_neighbors": int(common_neighbors),
                    "jaccard": float(jaccard),
                    "preferential_attachment": int(pref_attach),
                    "pagerank_product": float(pr_prod),
                    "same_department": int(same_dept),
                    "degree_diff": int(degree_diff)
                }
            }
        except Exception as e:
            return {"error": f"Simulation failed: {str(e)}"}

    def get_graph_metrics(self):
        if self.graph is None:
            return {"error": "Graph not loaded"}
        
        try:
            return {
                "nodes": self.graph.number_of_nodes(),
                "edges": self.graph.number_of_edges(),
                "avg_degree": sum(dict(self.graph.degree()).values()) / self.graph.number_of_nodes(),
                "density": nx.density(self.graph),
                "avg_clustering": nx.average_clustering(self.graph.to_undirected()),
                "message": "Graph metrics computed from live data"
            }
        except Exception as e:
            return {"error": f"Metrics failed: {str(e)}"}

    def get_embeddings_viz(self, method='pca'):
        if self.embeddings is None:
            return {"error": "Embeddings not loaded"}
        
        try:
            if method.lower() == 'tsne':
                from sklearn.manifold import TSNE
                model = TSNE(n_components=2, random_state=42, perplexity=30, max_iter=1000)
                reduced = model.fit_transform(self.embeddings)
            else:
                from sklearn.decomposition import PCA
                model = PCA(n_components=2)
                reduced = model.fit_transform(self.embeddings)
            
            points = []
            for node_id, idx in self.node_id_map.items():
                points.append({
                    "node_id": int(node_id),
                    "x": float(reduced[idx, 0]),
                    "y": float(reduced[idx, 1]),
                    "dept": self.labels.get(int(node_id), 0) if self.labels else 0
                })
            
            return {
                "method": method.lower(),
                "total_nodes": len(points),
                "points": points
            }
        except Exception as e:
            logger.error(f"Viz failed for {method}: {str(e)}")
            return {"error": f"Viz failed: {str(e)}"}

    def detect_communities(self, method: str = 'louvain'):
        if self.graph is None:
            return {"error": "Graph not loaded"}
        
        try:
            if method.lower() == 'louvain':
                import community as community_louvain
                partition = community_louvain.best_partition(self.graph.to_undirected())
                communities = {}
                for node, comm_id in partition.items():
                    if str(comm_id) not in communities:
                        communities[str(comm_id)] = []
                    communities[str(comm_id)].append(int(node))
                
                return {
                    "method": "louvain",
                    "num_communities": len(communities),
                    "communities": communities
                }
            elif method.lower() == 'kmeans':
                if self.embeddings is None or self.node_id_map is None:
                    return {"error": "Embeddings not loaded for K-Means"}
                
                from sklearn.cluster import KMeans
                # Using 12 clusters as a default representative of the core departments
                kmeans = KMeans(n_clusters=12, random_state=42, n_init='auto')
                clusters = kmeans.fit_predict(self.embeddings)
                
                communities = {}
                # Map back to real node IDs using node_id_map
                id_to_node = {idx: node_id for node_id, idx in self.node_id_map.items()}
                
                for idx, cluster_id in enumerate(clusters):
                    node_id = id_to_node.get(idx)
                    if node_id is not None:
                        if str(cluster_id) not in communities:
                            communities[str(cluster_id)] = []
                        communities[str(cluster_id)].append(int(node_id))
                
                return {
                    "method": "kmeans",
                    "num_communities": len(communities),
                    "communities": communities
                }
            else:
                return {"error": f"Method {method} not supported"}
        except Exception as e:
            return {"error": f"Community detection failed: {str(e)}"}

    def simulate_department(self, neighbor_ids: list):
        """Simulate department for a new node by averaging neighbor embeddings"""
        if self.classifier is None or self.embeddings is None:
            return {"error": "Model or embeddings not loaded"}
        
        valid_neighbor_embs = []
        for nid in neighbor_ids:
            if nid in self.node_id_map:
                idx = self.node_id_map[nid]
                valid_neighbor_embs.append(self.embeddings[idx])
        
        if not valid_neighbor_embs:
            return {"error": "None of the provided neighbors have precomputed embeddings"}
        
        # Average neighbor embeddings to estimate the new node's position in vector space
        avg_emb = np.mean(valid_neighbor_embs, axis=0).reshape(1, -1)
        
        pred = self.classifier.predict(avg_emb)[0]
        probs = self.classifier.predict_proba(avg_emb)[0]
        
        return {
            "predicted_department": int(pred),
            "confidence": float(np.max(probs)),
            "method": "neighbor_averaging",
            "num_neighbors_used": len(valid_neighbor_embs)
        }

    def predict_unseen(self, index: int = None):
        """Predict using a sample from the unseen test set"""
        print("self.X_test", self.X_test)
        print("self.y_test", self.y_test)
        print("self.classifier", self.classifier)
        if self.X_test is None or self.y_test is None or self.classifier is None:
            return {"error": "Test set or classifier not loaded"}
        
        if index is None:
            import random
            index = random.randint(0, len(self.X_test) - 1)
        
        if index < 0 or index >= len(self.X_test):
            return {"error": "Index out of bounds"}
            
        feat = self.X_test[index].reshape(1, -1)
        actual_dept = int(self.y_test[index])
        
        pred = self.classifier.predict(feat)[0]
        probs = self.classifier.predict_proba(feat)[0]
        
        return {
            "index": index,
            "actual_department": actual_dept,
            "predicted_department": int(pred),
            "confidence": float(np.max(probs)),
            "is_correct": bool(int(pred) == actual_dept)
        }

model_manager = ModelManager()
