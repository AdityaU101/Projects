<div align="center">

# 📊 Data Processing at Scale

**A semester project implementing large-scale graph analytics on NYC taxi trip data using Apache Kafka, Neo4j, and graph algorithms (PageRank & BFS).**

[![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![Apache Kafka](https://img.shields.io/badge/Apache%20Kafka-231F20?style=flat-square&logo=apachekafka&logoColor=white)](https://kafka.apache.org)
[![Neo4j](https://img.shields.io/badge/Neo4j-008CC1?style=flat-square&logo=neo4j&logoColor=white)](https://neo4j.com)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)](https://docker.com)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?style=flat-square&logo=kubernetes&logoColor=white)](https://kubernetes.io)

</div>

---

## 👋 About This Project

This project is a two-phase data engineering pipeline built around NYC Yellow Taxi trip data (March 2022). It focuses on trips within the **Bronx borough**, loading them into a Neo4j graph database where locations are nodes and trips are weighted edges. The pipeline supports real-time streaming ingestion via Kafka and exposes graph analytics through a Python interface.

**Phase 1** - batch ingestion via Parquet to Neo4j  
**Phase 2** - streaming ingestion via Kafka to Neo4j, plus graph algorithm queries

---

## ✨ Features

- Parquet-to-Neo4j bulk loader with Bronx borough filtering and data quality checks
- Real-time Kafka producer streaming trip records as JSON messages
- Graph projections via Neo4j GDS for PageRank and BFS traversal
- Weighted PageRank to identify the most and least central taxi locations
- BFS shortest-path queries between any two location nodes
- Fully containerized with Docker and Kubernetes manifests

---

## 🛠️ Tech Stack

**Languages**  
`Python` `Cypher`

**Data & Streaming**  
`Apache Kafka` `Apache ZooKeeper` `PyArrow` `Pandas`

**Graph Database**  
`Neo4j` `Neo4j GDS (Graph Data Science)`

**Infrastructure**  
`Docker` `Kubernetes`

---

## 🚀 Getting Started

### Prerequisites

- Docker and kubectl configured
- Python 3.9+
- NYC Yellow Taxi Parquet file (`yellow_tripdata_2022-03.parquet`) placed in the project root

### 1. Start the Cluster

```bash
kubectl apply -f zookeeper-setup.yaml
kubectl apply -f kafka-setup.yaml
kubectl apply -f neo4j-service.yaml
kubectl apply -f kafka-neo4j-connector.yaml
```

### 2. Batch Load (Phase 1)

```bash
pip install pyarrow pandas neo4j
python data_loader.py
```

### 3. Stream via Kafka (Phase 2)

```bash
pip install confluent-kafka
python data_producer.py
```

### 4. Run Graph Queries

```python
from interface import Interface

iface = Interface("neo4j://localhost:7687", "neo4j", "graphprocessing")
print(iface.pagerank(max_iterations=20, weight_property="distance"))
print(iface.bfs(start_node=159, last_node=235))
iface.close()
```

---

## 📂 Project Structure

```
Data Processing at Scale Sem Project/
├── data_loader.py             # Batch Parquet to Neo4j ingestion
├── data_producer.py           # Kafka streaming producer
├── interface.py               # PageRank & BFS query interface
├── Dockerfile                 # Neo4j + Python container image
├── kafka-setup.yaml           # Kafka Kubernetes manifest
├── zookeeper-setup.yaml       # ZooKeeper Kubernetes manifest
├── neo4j-service.yaml         # Neo4j Kubernetes service
├── neo4j-values.yaml          # Neo4j Helm values
├── kafka-neo4j-connector.yaml # Kafka to Neo4j connector config
└── aupadh47-Project-Phase2.pdf
```

---

## 📌 Notes

- The Bronx borough is defined by a hardcoded list of 43 NYC TLC location IDs
- Trips with `fare_amount <= $2.50` or `trip_distance <= 0.1 mi` are filtered out as noise
- Neo4j must be running with the GDS plugin enabled for PageRank and BFS to work
- `data_loader.py` retries up to 10 times with 10-second backoff on connection failure
