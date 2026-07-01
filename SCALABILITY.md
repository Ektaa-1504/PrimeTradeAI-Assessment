# Scalability Notes

This document outlines realistic paths to scale the Task Manager beyond a single-server deployment.

## Stateless Auth

JWT authentication is inherently stateless — there is no server-side session to manage. Any number of API server instances can verify tokens independently using the shared `JWT_SECRET`, making horizontal scaling behind a load balancer straightforward with zero changes to the auth code.

## Database

MongoDB Atlas supports replica sets and sharding out of the box. As task volume grows:

- The compound index on `{ owner, status }` in the Task model already covers the most common filtered queries.
- Additional indexes on `priority` and `createdAt` should be evaluated once read patterns are understood in production.
- Read replicas can serve dashboard/list endpoints to take load off the primary.

## Caching

The `/tasks` list endpoint is a good early candidate for a Redis read-through cache. A short TTL (e.g. 30 seconds) in front of the DB query would cut Mongo load significantly under high read traffic while keeping data fresh enough for task management use.

## Code Structure

The routes → controllers → models separation means adding a new entity (e.g. comments, projects) or extracting a service into a separate microservice is a contained change. Each controller module only depends on its own model and shared middleware, so they can be split into independent services if throughput requirements justify it.

## Rate Limiting

The current `express-rate-limit` implementation is in-process (memory-based). In a multi-instance setup, rate limit state won't be shared across instances. Switching the store to a Redis-backed rate limiter (e.g. `rate-limit-redis`) is a one-line config change.
