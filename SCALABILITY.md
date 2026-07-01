# Scalability Notes

This app is intentionally kept simple for the scope of this assignment. No
Redis, no Docker, no microservices in the actual code. But the architecture
was built with a few decisions in mind that would make scaling it up
straightforward later, without a rewrite. Here's how I would approach it if
traffic or data volume actually grew.

## Authentication scales for free

Since auth is JWT based, there is no session state sitting on the server.
Every request carries its own proof of identity, verified with the shared
secret. That means I could spin up five copies of this API behind a load
balancer tomorrow and none of them would need to know about each other. No
shared session store, no sticky sessions, nothing extra to coordinate. This
is one of the main reasons I went with JWT over server side sessions in the
first place.

## Database growth

MongoDB (via Atlas) already gives replica sets and sharding out of the box,
so the underlying infra is not the bottleneck. It is how the queries are
written. Right now, the Task model has a compound index on owner, status,
and createdAt, since that covers the most common query pattern in the app:
get this user's tasks, optionally filtered by status, newest first. If
usage patterns change later, say people start filtering by priority a lot,
that is an easy index to add on top. If read traffic ever outgrows a single
primary, read replicas could take the load off for things like the
dashboard list view, which does not need to hit the primary every time.

## Caching (not implemented, but the obvious next step)

The GET /tasks endpoint is the one route that would benefit most from
caching. It is read heavy and the data does not change every second. A
Redis based read through cache with a short TTL, around 30 seconds, in
front of that query would cut a meaningful chunk of database load without
making the data feel stale for a task list. I did not add this now because
at the current scale it is unnecessary complexity, but the code is
structured so it could be dropped in as a thin layer in the controller
without touching anything else.

## Why the folder structure matters here

Keeping routes, controllers, and models separate is not just for tidiness.
It is what makes future changes contained. If I needed to add a new
entity, comments or projects for example, it would not touch existing
modules. And if one part of this ever needed to become its own service,
say splitting auth into its own microservice while tasks stay where they
are, the boundaries already exist in the code. It would not be a clean
split day one, but it is not fighting against the architecture either.

## One honest limitation: rate limiting

Right now, express rate limit is memory based, which works fine for a
single instance but has a real gap. If this ran as multiple instances
behind a load balancer, each instance would track its own rate limit
counters independently, so someone could effectively get several times the
allowed requests by hitting different instances. The fix is well
understood though. Swap the in memory store for a Redis backed one,
rate limit redis, which is a small config change, not a redesign.
Flagging it here because it is the kind of thing that is fine to skip for
an assignment but would be one of the first things I would fix before this
went anywhere near real traffic.