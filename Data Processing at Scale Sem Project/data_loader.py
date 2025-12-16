import pyarrow.parquet as pq  #make sure to install this while running the code as it could cause errors
import pandas as pd #install this too locally
from neo4j import GraphDatabase #important install run the pip command
import time

class DataLoader:
    def __init__(self, uri, user, password):
        self.driver = GraphDatabase.driver(uri, auth=(user, password), encrypted=False)
        self.driver.verify_connectivity()

    def close(self):
        self.driver.close()

    def _create_constraint(self, tx):
        tx.run("CREATE CONSTRAINT location_name IF NOT EXISTS FOR (l:Location) REQUIRE l.name IS UNIQUE")

    def _load_from_csv(self, tx, csv_name):
        tx.run("""
            USING PERIODIC COMMIT 10000
            LOAD CSV WITH HEADERS FROM $url AS row
            WITH row
            WHERE row.PULocationID IS NOT NULL AND row.DOLocationID IS NOT NULL
            MERGE (p:Location {name: toInteger(row.PULocationID)})
            MERGE (d:Location {name: toInteger(row.DOLocationID)})
            MERGE (p)-[:TRIP {
                distance: toFloat(row.trip_distance),
                fare: toFloat(row.fare_amount),
                pickup_dt: datetime(row.tpep_pickup_datetime),
                dropoff_dt: datetime(row.tpep_dropoff_datetime)
            }]->(d)
        """, url=f"file:///{csv_name}") # some commands didnt work due to version mismatches keep in mind to check them out once.

    def load_transform_file(self, file_path):
        cols = [
            "tpep_pickup_datetime", "tpep_dropoff_datetime",
            "PULocationID", "DOLocationID", "trip_distance", "fare_amount"
        ]
        trips = pq.read_table(file_path, columns=cols).to_pandas()
        bronx = [3,18,20,31,32,46,47,51,58,59,60,69,78,81,94,119,126,136,147,159,167,168,169,174,182,183,184,185,199,200,208,212,213,220,235,240,241,242,247,248,250,254,259]
        trips = trips[trips["PULocationID"].isin(bronx) & trips["DOLocationID"].isin(bronx)]
        trips = trips[trips["trip_distance"] > 0.1]
        trips = trips[trips["fare_amount"] > 2.5]
        csv_name = file_path.split(".")[0] + ".csv"
        save_loc = "/var/lib/neo4j/import/" + csv_name
        trips.to_csv(save_loc, index=False)

        with self.driver.session() as sess:
            sess.execute_write(self._create_constraint)
            sess.execute_write(self._load_from_csv, csv_name=csv_name)

        print("Data load complete.") #just to make the data load is actually complete.

def main():
    total_attempts = 10 # take 10 attempts to load just in case...dunno what and when goes through
    attempt = 0
    while attempt < total_attempts:
        try:
            dl = DataLoader("neo4j://localhost:7687", "neo4j", "graphprocessing")
            dl.load_transform_file("yellow_tripdata_2022-03.parquet")
            dl.close()
            break
        except Exception as e:
            print(f"(Attempt {attempt+1}/{total_attempts}) Error:", e)
            attempt += 1
            time.sleep(10)

if __name__ == "__main__":
    main()
