---
{
  "id": "writing-reducing-api-payloads",
  "slug": "reducing-api-payloads",
  "title": "Reducing API Payloads with Response Shaping and Compression",
  "summary": "A measurement-led approach to making data-heavy APIs smaller by returning intentional fields, paginating work, and applying compression at the right boundary.",
  "status": "published",
  "publishedOn": "2026-07-20",
  "tags": ["API design", "Performance", "FastAPI", "Compression"],
  "featured": false
}
---

Large API responses usually grow gradually. A list endpoint starts with a few fields, then gains nested relationships, display helpers, permission state, and values needed by one specialized screen. Each addition looks harmless in review. Eventually a routine data-grid request transfers far more information than the interface can display, spends time serializing unused values, and approaches limits imposed by gateways or serverless integrations.

Compression can make that response smaller on the wire, but it cannot make an accidental contract intentional. The durable fix combines response shaping, bounded collection access, and compression. The order matters: remove data that should not be present, then compress what remains. This article presents a generalized method, including an approved public example in which primary grid responses moved from approximately 1.5–2 MB to below 1 MB. It does not describe a private schema or exact production configuration.

## Measure the whole response path

Start with evidence from the endpoint as clients actually call it. A payload measured in a unit test may differ from the payload after serialization, middleware, and gateway encoding. Capture at least the uncompressed response size, compressed transfer size, item count, query duration, serialization duration, and total latency for a representative request.

Do not optimize from one convenient sample. A page containing short labels can hide the cost of long descriptions or nested history. Build a small distribution across ordinary, large, and permission-heavy records. Keep the fixtures synthetic or approved; production payload capture can expose personal or confidential data.

Size is only one signal. A response can be small but slow because it triggers repeated database queries. It can be fast on the server but expensive in the browser because the client parses and stores a large object graph. The useful question is not simply “How many bytes?” It is “Which work and data does this user action require at each boundary?”

## Shape responses around a use case

An ORM model or internal aggregate is not an API response contract. Returning every available property couples clients to persistence details and makes future removal difficult. Define a read model for the screen or operation instead.

For a data grid, the read model normally contains stable identifiers, values shown in columns, fields required to determine available actions, and perhaps a compact version marker. Full descriptions, history, large nested relationships, and edit-only configuration can move to a detail endpoint requested when the user needs them.

This simplified FastAPI example makes the projection explicit:

```python
from pydantic import BaseModel


class GridRow(BaseModel):
    id: str
    name: str
    status: str
    updated_on: str
    allowed_actions: list[str]


def to_grid_row(record: DomainRecord) -> GridRow:
    return GridRow(
        id=record.public_id,
        name=record.display_name,
        status=record.status,
        updated_on=record.updated_on.isoformat(),
        allowed_actions=project_allowed_actions(record),
    )
```

The example is illustrative. Its important property is that a named response type documents every public field. An accidental relationship cannot appear merely because a serializer traversed it.

Response shaping also creates a security advantage. Data that is never serialized cannot leak through a client bug, browser extension, or verbose diagnostic. Do not use the frontend to hide fields that the current user should not receive.

## Bound collections before they reach serialization

Field selection helps each item, while pagination controls how many items are returned. Both are needed. A perfectly shaped row multiplied by an unbounded result set still creates unpredictable latency and memory use.

Choose pagination semantics that match the data. Offset pagination is easy to understand and supports direct page selection, but records inserted during navigation can shift boundaries. Cursor pagination provides more stable traversal for frequently changing data, but cursors need a deterministic sort and careful validation. Either approach should impose a maximum page size on the server rather than trusting a client-supplied limit.

Filtering and sorting must happen before pagination and preferably in the data store. Fetching every row, serializing it, and then slicing in application code defeats the purpose. Select only required columns when the persistence tool permits it, and inspect query counts so a compact response does not hide an N-plus-one query pattern.

| Technique           | Primary benefit        | Tradeoff                        | Verification signal                |
| ------------------- | ---------------------- | ------------------------------- | ---------------------------------- |
| Explicit read model | Removes unused fields  | More contract types to maintain | Field-level contract test          |
| Detail endpoint     | Defers heavy data      | Additional client request       | Interaction-level latency          |
| Bounded pagination  | Caps collection work   | Navigation complexity           | Maximum item and byte count        |
| Database projection | Reduces query transfer | Persistence-specific query code | Selected columns and query count   |
| Compression         | Reduces wire bytes     | CPU and buffering cost          | Content encoding and transfer size |

## Add compression at a deliberate boundary

JSON commonly compresses well because field names and structural characters repeat. Gzip is widely supported and can produce a meaningful reduction for medium and large text responses. It is not free: compression consumes CPU, can delay the first byte if the response is buffered, and adds little value to already small or compressed content.

Enable compression once at the boundary that owns the final response. If both application middleware and a proxy compress independently, behavior becomes difficult to reason about. Confirm how the gateway handles `Accept-Encoding`, whether it forwards or transforms `Content-Length`, and whether caches vary by content encoding.

Set a minimum response size so tiny payloads bypass compression. Exclude formats that are already compressed. Make the choice observable through response headers and metrics, but avoid high-cardinality labels such as raw URLs or user identifiers.

Compression should remain a transport detail. Clients must receive the same logical JSON whether compression is negotiated or not. Contract tests should decode both variants and compare their meaning.

## Protect the contract from regrowth

Payload work can regress when a developer adds a field for a new interface and reuses a shared serializer. Preventing regrowth requires a visible contract and tests at the projection boundary.

Assert the exact public keys of representative records, not only that a few expected keys exist. A positive-only assertion will pass when a large relationship is added accidentally. Keep response types scoped to use cases rather than building one universal schema with many optional fields.

Size budgets can complement contract tests. They should use stable generated fixtures and allow enough margin for deliberate evolution. A byte-for-byte snapshot is usually too brittle because harmless serialization changes can alter it. A maximum uncompressed size per representative item or page communicates the real constraint.

Client code should also avoid retaining discarded pages or duplicating large normalized objects without need. Server response improvements are most valuable when the browser consumes them intentionally.

## Failure modes worth testing

Several changes can make a payload smaller while making the system worse:

- Removing a field that a less visible client still consumes.
- Moving data to a detail endpoint and creating a burst of per-row requests.
- Computing derived fields with repeated database access.
- Compressing at two layers or advertising an encoding that was not applied.
- Caching compressed and uncompressed responses under the same incomplete key.
- Allowing a client to request an unbounded page size.
- Logging complete oversized responses during diagnosis.
- Treating a gateway limit as the only target and leaving no operating margin.

Inventory consumers before changing a public contract. If compatibility is uncertain, add a versioned response or migrate callers in a controlled sequence. The same reversible thinking used in [Phased Application Modernization Without a Big-Bang Cutover](/writings/phased-application-modernization) applies to API contracts.

## Test behavior, cost, and negotiation

Unit tests should cover projection rules, including permission-sensitive fields. Repository or integration tests should verify filtering, deterministic ordering, maximum page size, and query behavior against a real test database where practical. API tests should assert exact response keys and confirm that detail-only fields stay out of grid responses.

Compression tests should issue requests with and without `Accept-Encoding: gzip`. Verify the `Content-Encoding` response, decode the body, and compare the JSON document. Include a response below the compression threshold. If an edge component performs compression, exercise that deployed boundary in a controlled environment rather than assuming application tests cover it.

Performance checks do not need to become a noisy benchmark suite. A deterministic representative fixture can enforce item count and size budgets. Periodic profiling can then investigate query time, serialization time, and memory when the contract changes materially.

## A payload-reduction checklist

Before releasing a change, confirm:

- The measured request represents a real client use case.
- Uncompressed and compressed sizes are recorded separately.
- The endpoint returns an explicit read model rather than an internal object.
- Collection size is bounded and sorting is deterministic.
- Filtering, sorting, and projection happen before serialization.
- Authorization is applied before sensitive fields enter the response.
- Compression is owned by one understood boundary.
- Caches vary correctly by content encoding where required.
- Contract tests assert exact public keys.
- Detail loading does not create a per-row request storm.
- Logs and fixtures contain no confidential response bodies.
- The result retains operating margin below platform limits.

## Conclusion

Smaller responses come from smaller contracts first and transport compression second. Measurement identifies where the bytes and time are spent. Use-case read models remove accidental data, pagination bounds the work, database projection avoids fetching what will be discarded, and Gzip reduces the remaining repetitive representation on the wire.

The result is not only a response that fits beneath a limit. It is an API whose cost and public surface are easier to explain, test, and evolve.
