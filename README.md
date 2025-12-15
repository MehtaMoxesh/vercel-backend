# Sweet Shop Backend (Express + MongoDB)

Quick start for a Node + Express backend using MongoDB and JWT-based auth.

Setup

1. Copy `.env.example` to `.env` and set `MONGO_URI` and `JWT_SECRET`.
2. Start MongoDB using Docker Compose (recommended):

```bash
docker compose up -d
```

3. Install dependencies:

```bash
npm install
```

4. Seed database (creates admin@example.com / password):

```bash
npm run seed
```

5. Run dev server:

```bash
npm run dev
```

API Endpoints

- POST /api/auth/register {name,email,password}
- POST /api/auth/login {email,password}

Sweets endpoints (require Authorization: Bearer <token>):

- GET /api/sweets
- GET /api/sweets/search?q=...&category=...&minPrice=...&maxPrice=...
- POST /api/sweets {name,category,price,quantity}
- PUT /api/sweets/:id
- DELETE /api/sweets/:id (admin only)
- POST /api/sweets/:id/purchase
- POST /api/sweets/:id/restock {quantity} (admin only)
Note: POST /api/sweets and PUT /api/sweets/:id are now admin-only as well.

Cart endpoints (require Authorization: Bearer <token>):
- GET /api/cart - Get current user's cart
- POST /api/cart/items - Add item to cart { sweetId, quantity }
- PUT /api/cart/items/:itemId - Update item quantity
- DELETE /api/cart/items/:itemId - Remove an item from cart
- POST /api/cart/checkout - Purchase all items in cart (decrements stock)

Notes

- Use the seeded admin account to create additional sample entries.
- For production, set a strong `JWT_SECRET` and configure environment variables accordingly.

Troubleshooting: "docker" not recognized on Windows
-------------------------------------------------
If you see an error like `docker : The term 'docker' is not recognized`, Docker Desktop is not installed or not available in your PATH. You have two simple options:

1) Install Docker Desktop (recommended)
 - Download Docker Desktop for Windows from Docker Hub: https://www.docker.com/products/docker-desktop
 - Install Docker Desktop and follow the steps (enable WSL2 backend on Windows Home). Restart your computer if prompted.
 - Verify Docker is running by opening PowerShell and running:
 ```powershell
 docker --version
 docker compose version
 ```
 - Re-run the command to bring up MongoDB:
 ```bash
 docker compose up -d
 ```

2) Use local MongoDB or a cloud MongoDB (if you prefer not to install Docker)
 - Local MongoDB: Install MongoDB Community Server for Windows, start the service, and set `MONGO_URI` in your `.env` to `mongodb://localhost:27017/sweetsdb`.
 - MongoDB Atlas: Create a free cluster at https://www.mongodb.com/cloud/atlas and update `MONGO_URI` in your `.env` with the connection string.

If you prefer, you can also use package managers like `winget` (Windows 10/11) to install Docker Desktop:
```powershell
winget install --id Docker.DockerDesktop -e
```

After installing Docker, retry the Docker Compose and seed commands above.

Quick DB check (local install or Atlas)
-------------------------------------
You can quickly check that your backend can connect to your MongoDB by running the `dbcheck` script:

```powershell
cd backend
npm run dbcheck
```

This will print:
- A 'Connected' message (which confirms the driver connected using `MONGO_URI`),
- The list of databases on the server, and
- The list of collections in the database referenced by your `MONGO_URI`.

If you see `DB Check failed` with an error, the connection failed and the error message will describe the issue (auth, network, wrong host/port, etc.).

Deprecation warnings
--------------------
If you see warnings like `(node:...) [DEP0040] The 'punycode' module is deprecated.` this is only a warning emitted by Node or a dependency and is non-fatal for database connectivity. You can:
 - Ignore the warning for now (the script still checks connectivity), or
 - Run with a stack trace to find the origin: `node --trace-deprecation db-check.js`, and if desired upgrade or report the dependency causing it.
