// ============================================================
// Milestone 2: Installing Neo4j — Load Tax Data & Test Queries
// Project: NYC Real Estate Knowledge Graph
// Neo4j 5.x compatible
// ============================================================

// ---- LOAD TAX DATA ----
LOAD CSV WITH HEADERS FROM 'file:///NYC_Tax_Project_1_Final_Small.csv' AS row
MERGE (b:BBL {bbl: row.BBL, address: row.PROPERTY_ADDRESS})
MERGE (o:OWNER {name: row.OWNER})
MERGE (o)-[r:OWNS]->(b);


// ---- DISPLAY ALL NODES ----
MATCH (n)
RETURN n;

// OR with relationships
MATCH (n1)-[r]->(n2)
RETURN n1, r, n2;


// ---- FIND EMPIRE STATE BUILDING OWNER ----
// BBL 1008350041 = Empire State Building
MATCH (b:BBL)-[r]-(a)
WHERE b.bbl = '1008350041'
RETURN b, r, a;


// ---- LARGEST PROPERTY OWNER (top 10 by BBL count) ----
MATCH (o)-[:OWNS]->(b)
RETURN o, COLLECT(b) AS properties
ORDER BY SIZE(properties) DESC
LIMIT 10;


// ---- DELETE ALL NODES (reset) ----
// MATCH (n) DETACH DELETE n;
