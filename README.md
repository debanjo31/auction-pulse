# AuctionPulse

AuctionPulse is a secure, microservices-based online auction platform built with NestJS. It provides a scalable, extensible foundation for running auctions with virtual wallets, admin verification, real-time bidding, and reliable transaction handling.

The API enables users to create, participate in, and manage auctions securely. Sellers can list items with start/end dates, opening prices, and photos. Admins verify listings to prevent illegal or stolen items. Participants top up virtual wallets via integrated payments and place bids during active auctions. The platform coordinates bidding logic, transaction management, and auction resolution to ensure fairness and transparency.

Primary goal: provide a user-friendly, scalable alternative to traditional auction sites by simplifying payments through virtual wallets and improving safety with admin verification and real-time notifications.

## Key features

- User management: register, authenticate (JWT), and manage profiles.
- Auction creation: sellers list items with title, description, photos, start/end times, and opening price.
- Admin verification: review and approve/reject listings to ensure legality and authenticity.
- Wallet system: top up wallets via payment gateways (e.g., Stripe), track balances, and reserve funds for active bids.
- Bidding: place bids with real-time updates; system validates funds and auction status before accepting bids.
- Auction resolution: automatic resolution at auction end (determine winner, transfer funds, refund outbid users).
- Notifications: real-time alerts for outbids and auction updates via WebSockets (or Kafka + Redis + push/email fallbacks).
- Redis-backed caching and pub/sub for high-performance real-time flows and temporary state (bid locks, reservation cache, leaderboards).

## Architecture overview

AuctionPulse uses a microservices architecture built with NestJS and TypeORM (or your preferred ORM adapter for PostgreSQL). Services communicate via event-driven messaging (Kafka) and use Redis for caching and lightweight pub/sub.

Services (logical boundaries):

- User Service: registration, authentication (JWT), user profiles.
- Wallet Service: manages balances, top-ups, reservations, and transfers.
- Auction Service: create/update auctions, status transitions, scheduling start/end events.
- Bid Service: processes incoming bids, validates funds/reservations, debounces/serializes bid operations.
- Notification Service: delivers real-time updates (WebSockets/Socket.io) and email/push notifications.

Typical flows:

- Listing flow: Seller -> Auction Service -> Admin verification -> Auction Service publishes Approved event
- Bidding flow: Client -> Bid Service -> Wallet Service (reserve funds) -> Bid accepted -> Notification Service publishes outbid/leading events
- Resolution flow: Auction Service triggers end-of-auction -> Bid Service finalizes winner -> Wallet Service transfers funds -> Notification Service notifies participants

## Tech & system requirements

- Node.js v18 or higher
- pnpm v8 or higher (or npm/yarn if you adapt commands)
- PostgreSQL v14 or higher (production-grade DB)
- Kafka (e.g., Apache Kafka v3.x or Confluent Platform)
- Redis v7 or higher (caching and pub/sub)
- Docker & Docker Compose (recommended for local development)

## Local development (quick start)

1. Clone the repository:

   ```powershell
   git clone https://github.com/your-repo/auction-pulse.git
   cd auction-pulse
   ```

2. Install dependencies:

   ```powershell
   pnpm install
   ```

3. Start required infrastructure (Postgres, Kafka, Redis) for local development. Example uses Docker Compose:

   ```powershell
   docker-compose up -d postgres kafka redis
   ```

   Example docker-compose snippet for local dev (add this to your `docker-compose.yml` or adapt it):

   ```yaml
   services:
     postgres:
       image: postgres:14
       environment:
         POSTGRES_USER: user
         POSTGRES_PASSWORD: pass
         POSTGRES_DB: auctionpulse
       ports:
         - '5432:5432'
     kafka:
       image: confluentinc/cp-kafka:7.0.1
       environment:
         KAFKA_BROKER_ID: 1
         KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
         KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT
         KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:9092
       ports:
         - '9092:9092'
     redis:
       image: redis:7
       ports:
         - '6379:6379'
   ```

4. Create service-specific `.env` files

   Each microservice should have its own `.env` in its root directory (for example `apps/user/.env`). Example values:

   ```env
   DATABASE_URL=postgresql://user:pass@localhost:5432/auctionpulse?schema=public
   JWT_SECRET=your-secret-key
   STRIPE_API_KEY=your-stripe-key
   KAFKA_BROKER=localhost:9092
   REDIS_HOST=localhost
   REDIS_PORT=6379
   PORT=3000
   ```

5. Run database migrations (example uses TypeORM CLI configured in the repo):

   ```powershell
   pnpm typeorm migration:run
   ```

6. Start services in development mode (each microservice typically has its own script). From the monorepo root you might run:

   ```powershell
   pnpm start:dev
   ```

   By convention each microservice runs on a different port (e.g., 3000..3004). Check each service's README or `package.json` scripts for exact commands.

## Redis usage

Redis is used for:

- Caching frequently-read entities (auction listing metadata, thumbnails, computed leaderboards)
- Short-lived bid reservations and locks to avoid double-spend
- Pub/sub fallback (low-latency notifications between services or clustered WebSocket nodes)

Recommended patterns:

- Use Redis keys with TTL for bid reservations: `bid:reservation:{auctionId}:{userId}`
- Use Redis streams (or Kafka) for ordered event consumption if you need durable replays
- Avoid storing authoritative long-term state in Redis — keep PostgreSQL for persistence

## Kafka integration

- Use NestJS microservices with Kafka transport via `@nestjs/microservices` for cross-service events.
- Topic examples: `auction.events`, `bid.events`, `wallet.events`, `notification.events`.
- Design for at-least-once delivery: make idempotent consumers (use event ids or dedupe store).

## API behaviour & security

- Authentication: JWT tokens issued by the User Service. Services validate JWTs or use service-to-service auth where appropriate.
- Authorization: role-based checks (USER, SELLER, ADMIN) to protect admin endpoints and listing controls.
- Concurrency: Bid processing must validate the auction is active, verify/reserve funds in Wallet Service, and then persist the accepted bid.
- Edge cases to consider: clock skew (use UTC + server time sync), network partitions (Kafka retries), partial failures during resolution (use compensating transactions).

## Personas

- Seller (User): Age 25–50, tech-savvy individual or small business owner. Needs easy listing tools and admin verification for credibility.
- Bidder (User): Age 18–45, bargain hunter or collector. Requires simple wallet top-up, real-time bid updates, and secure transactions.
- Admin: Platform moderator, age 30+, responsible for verifying auctions and handling disputes. Needs a dashboard for oversight and actionable verification workflows.

## User scenarios

- Seller scenario: Jane logs in, uploads item photos and details, sets a 7-day auction with a $50 opening price starting next week. She submits the listing for admin review and receives an approval notification.

- Bidder scenario: Mike tops up his wallet with $200 via credit card, searches for "vintage watches", places a $60 bid on an active auction, gets outbid, receives a real-time notification, and rebids $70.

- Admin scenario: Admin reviews a new auction listing, checks for illegal content (e.g., no weapons), verifies item authenticity via uploaded proofs, and approves or rejects with feedback.

- Auction end scenario: At the end time the system determines the highest bidder, transfers funds from their wallet to the seller's wallet, and notifies all participants. Outbid users receive refunds of reserved funds.

## Testing

- Unit and integration tests are planned with Jest. Run tests with:

  ```powershell
  pnpm test
  ```

- For end-to-end tests, spin up the local infrastructure (`docker-compose`) and run the e2e suites configured per service.

## Scaling & production notes

- Deploy microservices in containers (Docker) and manage with Kubernetes for high availability.
- Use Kafka partitions and consumer groups to distribute load across multiple consumers for bid and audit streams.
- Use Redis for caching and to coordinate WebSocket clusters (pub/sub) — but keep persistent state in PostgreSQL.
- Monitor and alert using Prometheus/Grafana; instrument services with metrics (latency, error rates, bid throughput).
- Ensure transactional safety on money transfers: prefer database-level transactions where possible and design robust compensating workflows when spanning services.

## Running in Docker (production/dev)

- Build Docker images for each service and deploy with Docker Compose or Kubernetes manifests.
- For production, replace local credentials with secrets managers (Azure Key Vault, AWS Secrets Manager, HashiCorp Vault).

