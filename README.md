# Backend of the web blog

## Dependencies

* **PostgreSQL 14.3**
* **Node.js >=14.19.2**

## Configuration

### .env file

Create `.env` file in the root of the project, fill it with values:

```bash
PGDATABASE=database-name
PGUSER=database-user
PGPASSWORD=password-of-the-user
```

### Database

Fill the database with code from the `./database.sql` file.

## Run

```bash
npm run start
```