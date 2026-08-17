---
{
  "id": "writing-jwt-revocation-rate-limiting-redis",
  "slug": "jwt-revocation-rate-limiting-redis",
  "title": "Designing JWT Revocation and API Rate Limiting with Redis",
  "summary": "A boundary-focused design for using Redis to revoke otherwise valid JWTs and enforce atomic API rate limits without confusing the two policies.",
  "status": "published",
  "publishedOn": "2026-08-03",
  "tags": ["Authentication", "Redis", "API design", "Security"],
  "featured": false
}
---

JSON Web Tokens are attractive because an API can verify a signed access token without loading a server-side session for every request. That independence has a consequence: a correctly signed token normally remains valid until its expiry, even after a user signs out or an administrator needs to end access. Rate limiting has a different goal. It bounds how often an identity or client may perform an operation, regardless of whether its token is otherwise valid.

Redis can support both policies, but they should remain separate in the design. Revocation asks whether one token or token family must no longer be accepted. Rate limiting asks whether a request fits within a defined allowance. Combining them into one opaque cache rule makes security behavior difficult to audit and failure handling difficult to choose.

This article describes an illustrative architecture. Key names, limits, and code are simplified examples rather than a production configuration.

## Define the token lifecycle first

Revocation cannot be designed from the signature algorithm alone. Start by defining access-token lifetime, refresh behavior, logout semantics, credential-change behavior, and the scope of an administrative revocation.

A short-lived access token reduces the period during which a stolen token is useful. A refresh token can provide a longer user session while remaining subject to server-side state and rotation. If the application issues only long-lived access tokens, the revocation store becomes part of nearly every security response. If access tokens are short lived, revocation still matters for urgent cases but retains bounded storage.

Every access token intended for individual revocation needs a stable unique identifier, commonly the `jti` claim. It also needs an expiry that the verifier enforces. Subject, issuer, audience, and token type should be validated according to the application contract; finding a valid signature is not sufficient.

Write the lifecycle as transitions:

1. Issue a token with a unique identifier and finite expiry.
2. Verify cryptography and required claims on each protected request.
3. Check whether the identifier is revoked when policy requires it.
4. On logout or a security action, record revocation for no longer than the remaining token life.
5. Allow the revocation entry to expire automatically after the token can no longer pass normal validation.

The Redis record should not outlive the token. A time-to-live keeps storage bounded and removes the need for a separate cleanup process.

## Keep revocation keys minimal and expiring

A simple token-level key can contain a hash or non-sensitive representation of the token identifier. Do not place the complete JWT in the key or value. Tokens can contain identifying claims, and full credentials should not appear in logs, dashboards, or cache inspection output.

An illustrative key shape is:

```text
auth:revoked:token:<hashed-jti> = 1
TTL = token expiry minus current time
```

Hashing the identifier does not repair a weak or predictable identifier, but it can reduce accidental disclosure in operational tooling. Prefixes make ownership clear and allow revocation data to have separate retention and access policy from rate-limit counters.

Token-level revocation is precise. Some events need a wider scope, such as ending every session after a credential reset. Storing every active token for a user can become expensive. Another pattern keeps a per-user security version or “valid after” timestamp in server-side state and includes a corresponding claim in issued tokens. A request is rejected if its token predates that boundary. This trades one broad lookup for simpler mass revocation.

Choose scopes deliberately:

| Revocation scope          | Useful for                    | Cost                                  | Important constraint                  |
| ------------------------- | ----------------------------- | ------------------------------------- | ------------------------------------- |
| Token identifier          | Logout one session            | One expiring key per revoked token    | Requires unique token ID              |
| Refresh-token family      | Detecting rotated-token reuse | Family state and lineage              | Rotation must be atomic               |
| User security version     | End all user sessions         | Lookup per protected request or cache | Version changes must be authoritative |
| Global signing-key change | Broad emergency invalidation  | Operationally disruptive              | Affects every token using the key     |

Do not use a signing-key rotation as the routine logout mechanism. Key rotation is an operational security control with a much wider blast radius.

## Order authentication checks predictably

A protected request should pass through a clear sequence. Parse the authorization header, verify the token’s signature and required claims, determine the token identifier, check revocation, then construct the authenticated identity used by authorization. Rate limiting may run before or after some of these steps depending on the threat being controlled.

An IP-based protective limit can run before authentication to reduce anonymous abuse. A user-level business limit requires a verified identity and therefore runs after token validation. Do not trust an unverified subject claim to select a rate-limit bucket; an attacker could choose another user’s identifier.

Revocation-store failure needs an explicit policy. For security-sensitive operations, accepting a token because Redis is unavailable may defeat the purpose of revocation. Failing closed is safer but turns Redis availability into API availability. Some lower-risk read paths might use a very short, bounded local cache of negative results, but that delays revocation and must be an explicit risk decision. There is no honest configuration that provides immediate central revocation with no dependency on the central check.

## Model rate limits as atomic state transitions

Rate limiting is vulnerable to race conditions when implemented as separate read and write operations. Two concurrent requests can both observe the same counter and both proceed. The decision and update need to be atomic.

A fixed-window counter is easy to operate: increment a key for an identity and route, set its expiry when the window begins, and reject values above the allowance. It can permit a burst around the boundary between windows. Sliding-window logs are more precise but store more entries. Token-bucket and leaky-bucket approaches model replenishment and bursts with compact state, but their atomic arithmetic is more involved.

Redis transactions or a Lua script can make the transition atomic. This pseudocode illustrates the required result rather than a deployable script:

```text
key = rate-limit:<policy>:<verified-principal>
current = atomically increment key
if current is first value:
  set expiry for window duration
remaining = max(allowance - current, 0)
allowed = current <= allowance
return allowed, remaining, key expiry
```

The policy identifier should encode an owned rule, not raw request input. Normalize route templates so unique object IDs do not create a separate bucket for every URL. Avoid placing email addresses, tokens, or other personal data in keys. A stable internal principal identifier or a keyed digest is safer.

## Return useful limits without exposing internals

When a request is limited, return the status and retry guidance defined by the API contract. A `Retry-After` value helps a cooperative client back off. Optional limit and remaining headers can improve client behavior, but they should match the actual algorithm. A sliding policy cannot honestly report itself as a fixed reset instant if no such instant exists.

Error bodies should be stable and small. Do not reveal Redis key names, internal account state, or which identifier was selected. Logs can record the policy name and outcome using approved low-cardinality fields. They should not include complete authorization headers.

Different operations deserve different policies. A cheap read, an authentication attempt, and an expensive export have different cost and abuse characteristics. One global allowance is easy to configure but often either blocks legitimate use or fails to protect the expensive path. Start with a small policy catalog owned alongside API behavior.

## Separate namespaces and access paths

Revocation entries and rate-limit counters can share a Redis deployment when operational requirements allow, but their keyspaces, metrics, and code paths should be distinguishable. Revocation is authentication state. Rate limiting is request-control state. A broad cache flush intended to reset counters must never restore revoked access.

Use explicit prefixes, independent helper interfaces, and the narrowest Redis permissions supported by the environment. Configure persistence and replication according to the consequence of losing each state. If all rate counters disappear, a short burst may pass. If revocation state disappears, tokens that were deliberately disabled may become usable until expiry. Those are not equivalent failures.

Capacity planning should consider worst-case outstanding revocations, active limit buckets, TTL distribution, and per-key overhead. Avoid keys with no expiry. Monitor evictions separately from ordinary expiry because eviction means policy state disappeared before its intended lifetime.

## Failure modes to test

Security code often works in the ordinary path and fails at boundaries. Test at least:

- a valid signed token with a revoked identifier;
- an expired token whose revocation key has already expired;
- two tokens for the same user when only one is revoked;
- a broad user-level revocation after credential change;
- malformed, missing, or duplicated token identifiers;
- concurrent requests at the rate-limit boundary;
- a first request that must set the counter expiry;
- route normalization so object identifiers share the intended policy;
- Redis timeout behavior for both revocation and rate limiting;
- clock differences around token and key expiry; and
- logs and errors that must not expose credentials or personal identifiers.

Concurrency tests should use the real Redis command or script boundary where practical. A mocked increment cannot demonstrate atomicity. Keep a small isolated unit test for policy selection, then add integration coverage for the state transition.

## An implementation checklist

Before enabling either feature, confirm:

- Access and refresh lifetimes are explicit and finite.
- Every revocable access token has a unique validated identifier.
- Revocation keys contain no complete token and always have a TTL.
- Single-session and all-session revocation semantics are distinct.
- Cryptographic and claim validation occurs before trusting identity fields.
- Revocation-store failure behavior is documented per risk boundary.
- Rate-limit principal and route keys are normalized and non-sensitive.
- Counter decisions and updates are atomic.
- Response headers match the chosen limiting algorithm.
- Counter reset operations cannot remove revocation state.
- Integration tests cover concurrency, expiry, outage, and isolation.
- Dashboards distinguish ordinary expiry, eviction, rejection, and dependency failure.

## Conclusion

Redis is a useful state boundary for JWT revocation and rate limiting because it provides expiring keys and atomic operations. It does not decide the security policy. A sound design begins with token lifecycle and revocation scope, then defines failure behavior. Rate limiting begins with a principal, an owned policy, and an atomic algorithm.

Keeping those concerns separate makes each easier to reason about. Revocation can answer whether an otherwise valid token is still acceptable. Rate limiting can answer whether an authenticated or anonymous request fits within its allowance. Clear namespaces, finite retention, non-sensitive keys, and real integration tests turn those answers into dependable API behavior.
