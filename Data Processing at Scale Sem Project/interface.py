from neo4j import GraphDatabase

class Interface:
    def __init__(self, uri, user, password):
        self._driver = GraphDatabase.driver(uri, auth=(user, password), encrypted=False)
        self._driver.verify_connectivity()

    def close(self):
        self._driver.close()

    def _project_graph(self, session, graph_name: str, weight_property: str | None = None):
        session.run("CALL gds.graph.drop($g, false)", g=graph_name)
        if weight_property:
            session.run("""
                CALL gds.graph.project(
                  $g,
                  'Location',
                  { TRIP: {
                      orientation: 'NATURAL',
                      properties: { w: { property: $wprop, defaultValue: 1.0 } }
                    }
                  }
                )
            """, g=graph_name, wprop=weight_property)
        else:
            session.run("CALL gds.graph.project($g,'Location','TRIP')", g=graph_name)

    #check the relevant materials so the page rank algo runs and return the expected output from the tester.py
    def pagerank(self, max_iterations: int, weight_property: str):
        with self._driver.session() as sess:
            self._project_graph(sess, "g_pr", weight_property)
            rows = sess.run("""
                CALL gds.pageRank.stream('g_pr', {
                  maxIterations: toInteger($iters),
                  relationshipWeightProperty: 'w'
                })
                YIELD nodeId, score
                RETURN gds.util.asNode(nodeId).name AS name, score
                ORDER BY score ASC
            """, iters=max_iterations).data()
            if not rows:
                return []
            min_name = int(rows[0]["name"])
            min_score = float(rows[0]["score"])
            max_name = int(rows[-1]["name"])
            max_score = float(rows[-1]["score"])
            return [
                {"name": max_name, "score": max_score},
                {"name": min_name, "score": min_score},
            ]
    # I have to keep in mind the return type expected by the tester.py file
    def bfs(self, start_node: int, last_node: int):
        with self._driver.session() as sess:
            self._project_graph(sess, "g_bfs", None)

            rec = sess.run("""
                MATCH (s:Location {name: toInteger($start)}),
                      (t:Location {name: toInteger($end)})
                WITH id(s) AS sid, id(t) AS tid
                CALL gds.bfs.stream('g_bfs', {
                  sourceNode: sid,
                  targetNodes: [tid]
                })
                YIELD path
                RETURN [n IN nodes(path) | {name: toInteger(n.name)} ] AS node_maps
            """, start=start_node, end=last_node).single()
            # return is a bit convoluted in the tester so switch accordingly
            if rec and rec["node_maps"]:
                return [{"path": rec["node_maps"]}]
            else:
                return [{"path": []}]

#testing for any kind of issue while printing the output.
if __name__ == "__main__":
    iface = Interface("neo4j://localhost:7687", "neo4j", "graphprocessing")
    print("PR distance:", iface.pagerank(20, "distance"))
    print("BFS 159->235:", iface.bfs(159, 235))
    iface.close()
