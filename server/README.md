# Server Notes

## DB Indexes

Leads rely on a few indexes to make filtering and sorting efficient (`status`, `source`, `createdAt`, `name`, `email`).

If you have an existing deployment and need to add the indexes without downtime, run the migration script against your MongoDB URI:

```bash
MONGO_URI="your-mongo-uri" node scripts/add-lead-indexes.ts
```

This script connects to the DB and calls `LeadModel.createIndexes()` which will create the indexes in the background.
