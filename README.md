# AuctionPulse

AuctionPulse is a microservices-based online auction platform built with NestJS, AWS CDK, and modern cloud infrastructure. The platform enables users to create, participate in, and manage auctions with virtual wallets, admin verification, and real-time bidding.

The API enables users to create, participate in, and manage auctions securely. Sellers can list items with start/end dates, opening prices, and photos. Admins verify listings to prevent illegal or stolen items. Participants top up virtual wallets via integrated payments and place bids during active auctions. The platform coordinates bidding logic, transaction management, and auction resolution to ensure fairness and transparency.

Primary goal: provide a user-friendly, scalable alternative to traditional auction sites by simplifying payments through virtual wallets and improving safety with admin verification and real-time notifications.

## Tech Stack

- **Backend**: NestJS with TypeScript
- **Database**: PostgreSQL with TypeORM
- **Message Queue**: Apache Kafka
- **Caching**: Redis
- **Infrastructure**: AWS CDK (CloudFormation)
- **Containerization**: Docker
- **Monorepo**: NX Workspace
- **Cloud Storage**: AWS S3
- **Monitoring**: AWS CloudWatch

## Architecture

The platform uses a microservices architecture with the following services:

- **API Gateway**: Entry point for all client requests
- **User Service**: Authentication, user management, JWT tokens
- **Auction Service**: Auction creation, management, and lifecycle
- **Bid Service**: Bid processing, validation, and real-time updates
- **Wallet Service**: Virtual wallet management, payments, fund transfers
- **Notification Service**: Real-time notifications via WebSockets and email

## Key Features

- User registration and JWT authentication
- Auction creation with admin verification
- Virtual wallet system with payment integration
- Real-time bidding with WebSocket updates
- Admin dashboard for auction verification
- Redis caching for performance
- Kafka event-driven communication
- AWS S3 for file storage

## Infrastructure

The platform is deployed on AWS using CDK:

- **S3 Buckets**: Public access for auction images and static assets
- **RDS PostgreSQL**: Managed database for persistent storage
- **ElastiCache Redis**: Managed Redis for caching and pub/sub
- **MSK Kafka**: Managed Kafka for event streaming
- **ECS Fargate**: Containerized microservices
- **Application Load Balancer**: Traffic routing and SSL termination

## Development Setup

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- AWS CLI configured
- CDK CLI installed

- Seller (User): Age 25–50, tech-savvy individual or small business owner. Needs easy listing tools and admin verification for credibility.
- Bidder (User): Age 18–45, bargain hunter or collector. Requires simple wallet top-up, real-time bid updates, and secure transactions.
- Admin: Platform moderator, age 30+, responsible for verifying auctions and handling disputes. Needs a dashboard for oversight and actionable verification workflows.

## User scenarios

- Seller scenario: Jane logs in, uploads item photos and details, sets a 7-day auction with a $50 opening price starting next week. She submits the listing for admin review and receives an approval notification.

- Bidder scenario: Mike tops up his wallet with $200 via credit card, searches for "vintage watches", places a $60 bid on an active auction, gets outbid, receives a real-time notification, and rebids $70.

- Admin scenario: Admin reviews a new auction listing, checks for illegal content (e.g., no weapons), verifies item authenticity via uploaded proofs, and approves or rejects with feedback.

- Auction end scenario: At the end time the system determines the highest bidder, transfers funds from their wallet to the seller's wallet, and notifies all participants. Outbid users receive refunds of reserved funds.
