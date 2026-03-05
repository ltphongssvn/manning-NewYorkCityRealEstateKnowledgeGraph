// ============================================================
// Milestone 3: Finding Property Owners
// Project: NYC Real Estate Knowledge Graph
// Neo4j 5.x compatible
// Schema: OWNER -> BBL, OWNER -> CONTACT_ADDRESS
// Relationships stamped with data source and date
// ============================================================

// ---- LOAD TAX DATA ----
LOAD CSV WITH HEADERS FROM 'file:///NYC_Tax_Project_1_Final_Small.csv' AS row
MERGE (b:BBL {bbl: row.BBL, address: row.PROPERTY_ADDRESS})
MERGE (o:OWNER {name: row.OWNER})
MERGE (o)-[r:TAX_ASSESSOR_OWNER {date: '01/01/2022'}]->(b);


// ---- LOAD DEEDS DATA ----
LOAD CSV WITH HEADERS FROM 'file:///NYC_Deeds_Project_1_Final_Small.csv' AS row
MATCH (b:BBL {bbl: row.BBL})
MERGE (o:OWNER {name: row.NAME})
MERGE (o)-[r1:DEED_OWNER {date: row.`DOC. DATE`}]->(b)
FOREACH (x IN CASE WHEN row.OWNER_ADDRESS IS NOT NULL THEN [1] ELSE [] END |
  MERGE (a:CONTACT_ADDRESS {address: row.OWNER_ADDRESS})
  MERGE (o)-[r2:DEED_OWNER {date: row.`DOC. DATE`}]->(a));


// ---- LOAD PERMITS DATA ----
LOAD CSV WITH HEADERS FROM 'file:///NYC_Permit_Project_1_Final_Small.csv' AS row
WITH row WHERE row.`Issuance Date` IS NOT NULL
MATCH (b:BBL {bbl: row.BBL})
MERGE (o:OWNER {name: row.OWNER_FULL_NAME})
MERGE (o)-[r1:PERMIT_OWNER {date: row.`Issuance Date`}]->(b)
FOREACH (x IN CASE WHEN row.OWNER_ADDRESS IS NOT NULL THEN [1] ELSE [] END |
  MERGE (a:CONTACT_ADDRESS {address: row.OWNER_ADDRESS})
  MERGE (o)-[r2:PERMIT_OWNER {date: row.`Issuance Date`}]->(a));


// ---- DISPLAY ALL NODES ----
MATCH (n)
RETURN n;

// OR with relationships
MATCH (n1)-[r]->(n2)
RETURN n1, r, n2;


// ---- DELETE UNAVAILABLE OWNER NODE ----
MATCH (e:OWNER {name: 'UNAVAILABLE OWNER'})
DETACH DELETE e;


// ---- TOP 3 OWNERS BY DISTINCT BBL COUNT ----
MATCH (o:OWNER)-[]->(b:BBL)
RETURN o, COLLECT(DISTINCT b) AS properties
ORDER BY SIZE(properties) DESC
LIMIT 3;


// ---- EMPIRE STATE BUILDING OWNER + CONTACT ----
// BBL 1008350041 = Empire State Building
MATCH (b:BBL {bbl: '1008350041'})
MATCH (o:OWNER)-[r1]->(b)
OPTIONAL MATCH (o:OWNER)-[r2]->(a:CONTACT_ADDRESS)
RETURN o, r1, b, r2, a;


// ---- OWNER OF BBL 1006971016 ----
MATCH (o:OWNER)-[r]->(b:BBL)
WHERE b.bbl = '1006971016'
RETURN o, r, b;


// ---- CONTACT ADDRESS FOR BBL 1007330008 ----
MATCH (a:CONTACT_ADDRESS)-[r2]-(o:OWNER)-[r1]-(b:BBL {bbl: '1007330008'})
RETURN o, r1, b, r2, a;


// ---- NUMBER OF TOTAL BBLs ----
MATCH (b:BBL)
RETURN COUNT(b);


// ---- BBLs WITHOUT TAX_ASSESSOR_OWNER ----
MATCH (b:BBL), ()-[r]-(b)
WITH b, COLLECT(DISTINCT TYPE(r)) AS reln_types
WHERE NOT 'TAX_ASSESSOR_OWNER' IN reln_types
RETURN b, reln_types;


// ---- BBLs WITH BOTH TAX_ASSESSOR_OWNER AND DEED_OWNER ----
MATCH (b:BBL), ()-[r]-(b)
WITH b, COLLECT(DISTINCT TYPE(r)) AS reln_types
WHERE 'TAX_ASSESSOR_OWNER' IN reln_types AND 'DEED_OWNER' IN reln_types
RETURN b, reln_types;


// ---- LARGE GRAPH LOAD (APOC batch) ----
// Uncomment for NYC_Tax_Project_1_Final_Large.csv
// CALL apoc.periodic.iterate(
//   "CALL apoc.load.csv('file:///NYC_Tax_Project_1_Final_Large.csv') YIELD lineNo, map AS row RETURN row",
//   "MERGE (b:BBL {bbl: row.BBL, address: row.PROPERTY_ADDRESS})
//    FOREACH (x IN CASE WHEN row.OWNER IS NOT NULL THEN [1] ELSE [] END |
//      MERGE (o:OWNER {name: row.OWNER})
//      MERGE (o)-[r:TAX_ASSESSOR_OWNER {date: '01/01/2022'}]->(b));",
//   {batchSize: 2000, iterateList: true, parallel: true}
// );
