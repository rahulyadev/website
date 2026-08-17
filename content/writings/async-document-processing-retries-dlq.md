---
{
  "id": "writing-async-document-processing-retries-dlq",
  "slug": "async-document-processing-retries-dlq",
  "title": "Designing Asynchronous Document Processing with Retries, Backoff, and Dead-Letter Queues",
  "summary": "A generalized design for reliable document-processing workers that separates durable intake, idempotent stages, bounded retries, and operator-owned dead-letter recovery.",
  "status": "published",
  "publishedOn": "2026-08-17",
  "tags": ["Asynchronous processing", "RabbitMQ", "Reliability", "Python"],
  "featured": false
}
---

Document processing rarely fits comfortably inside one request. Uploads can be large, extraction tools can be slow, and enrichment may depend on services with variable latency. Keeping the HTTP connection open ties user experience to every downstream step and makes a transient dependency failure look like an upload failure.

An asynchronous design can accept work durably, return a stable job identifier, and process stages in the background. That does not make failure disappear. It changes the responsibility: the system must define delivery guarantees, duplicate handling, retry limits, status transitions, and the point at which an operator needs to intervene.

This article presents a generalized design informed by prototyping asynchronous document processing with RabbitMQ. It is not a claim about a production deployment, private workflow, or exact infrastructure.

## Separate durable intake from processing

The intake request should validate what it can establish quickly: caller permission, declared media type, size policy, and required metadata. The document itself should be stored durably before a message is considered ready for processing. A queue message is not a safe substitute for object storage when the payload is large or must survive redelivery.

Create a job record with a public opaque identifier and an initial state such as `accepted`. Store the document under an internal storage reference that is not exposed as an unrestricted URL. Then publish a compact message containing the job identifier, a version, and the minimum routing context the worker needs.

The database write and message publish form a consistency boundary. If the record commits but publishing fails, the job can remain stranded. If the message publishes before the record commits, a worker can receive work it cannot find. An outbox pattern is one credible solution: commit the job and an outbox event in one database transaction, then let a publisher deliver unsent events and record success. The added component is worthwhile when losing accepted work is unacceptable.

Return an accepted response only after the durable intake contract is satisfied. The client can poll a status endpoint or receive a separately designed notification later. Do not return an internal queue identifier or storage path as the public job contract.

## Model processing as explicit stages

A single “process document” task can hide where time and failures occur. Split the workflow into stages that have clear inputs and outputs, such as validation, extraction, normalization, and persistence. A stage boundary is useful when its result can be recorded, retried independently, or inspected safely.

Avoid splitting so finely that the queue becomes a distributed function-call mechanism. Every message boundary adds serialization, delivery, observability, and compatibility work. A good stage performs a meaningful, idempotent transition and records enough state for the next stage to resume.

An illustrative job state model might be:

```text
accepted -> validating -> extracting -> normalizing -> completed
     |           |             |              |
     +-----------+-------------+--------------+-> failed
```

Workers should not trust the message as the complete source of state. Load the current job record, verify that the requested transition is still applicable, and claim work in a concurrency-safe way. A stale duplicate message for an already completed job should become a harmless no-op, not restart the workflow.

## Design for at-least-once delivery

Many practical queue configurations provide at-least-once delivery. A worker may finish its side effect and crash before acknowledging the message, so the broker delivers it again. Exactly-once processing cannot be obtained by simply changing the acknowledgement order: acknowledging first can lose work, while acknowledging after the side effect can repeat work.

Idempotency is therefore a core design property. Give each job and stage a stable identity. Before performing a side effect, check whether that stage result is already committed. Where possible, use a unique database constraint on the job-stage key so two workers cannot both create the result. If a remote dependency accepts idempotency keys, pass a stable request key and retain its outcome.

The worker should acknowledge only after the durable stage outcome is recorded. If it loses its connection before acknowledgement, redelivery will observe that outcome and finish safely. This is stronger than keeping a short-lived “currently processing” flag that disappears during a crash.

Idempotency must cover failure paths too. Incrementing an attempt counter, storing an error category, and scheduling the next retry should form one coherent transition. Otherwise, repeated delivery can create multiple retry messages for the same attempt.

## Classify errors before retrying

Retrying every exception wastes capacity and delays clear failure. Classify failures into at least transient, permanent, and unknown categories.

Transient failures include a dependency timeout, a temporary connection error, or an explicitly retryable service response. Permanent failures include an unsupported document, invalid content, or a business rule that cannot become true through waiting. Unknown failures deserve a bounded retry because the classification itself may be incomplete, followed by dead-letter handling and investigation.

Do not encode classification as a list of exception names scattered across workers. Map infrastructure and domain errors into an owned stage outcome. Include a safe error code for status and metrics, while keeping sensitive document text and credentials out of messages and logs.

Cancellation is another outcome, not an exception to ignore. A worker should check job state before expensive work and before committing a result. If cancellation races with a final commit, the state transition rule must decide which outcome wins.

## Use bounded exponential backoff with jitter

Immediate retries can amplify an outage. If many workers receive the same dependency error, putting messages straight back on the ready queue creates a tight loop that consumes CPU and connection capacity while preventing healthy work from progressing.

Exponential backoff increases delay after each failed attempt. Jitter prevents all failed jobs from returning at the same instant. The delay should have a maximum cap, and the total attempts or elapsed retry window must be finite.

This pseudocode is illustrative:

```python
def retry_delay(attempt: int, base_seconds: float, cap_seconds: float) -> float:
    exponential = min(cap_seconds, base_seconds * (2 ** attempt))
    return random.uniform(exponential * 0.5, exponential)
```

The values should reflect dependency recovery characteristics and user expectations rather than copied defaults. A status endpoint can report that processing is retrying without exposing internal exception text. If the workflow has a user-visible deadline, stop retrying when success would no longer be useful.

In RabbitMQ, delayed delivery can be implemented through queue topology and message expiration patterns or an approved delayed-message capability. The exact choice affects ordering and operational complexity. Whichever mechanism is used, make the attempt number and next eligible time explicit, validate them on receipt, and prevent clients from supplying them.

## Give the dead-letter queue an owner

A dead-letter queue is not a long-term archive and not evidence that failure handling is complete. It is a bounded holding area for messages the normal workflow cannot process safely. Every dead-lettered item needs a reason, enough non-sensitive context to locate the job, and an operator-owned recovery path.

Define which events enter it: exhausted transient retries, unknown worker failures after the limit, invalid message versions, or rejected messages that indicate a producer defect. A permanently invalid document may be better represented as a normal failed job without retaining a queue message. Dead-lettering policy should match the possibility of recovery.

Monitor dead-letter arrival rate and oldest-item age. Alerts should identify the stage and safe error category, not include document contents. Set retention deliberately. If messages expire from the dead-letter queue, the durable job record should still retain an approved failure status and audit trail.

Redrive must be controlled. An operator or repair tool should inspect the cause, correct configuration or data when permitted, and create a new bounded attempt. Bulk replaying every dead-lettered message after an outage can recreate the original load spike. Preserve the original job identity so idempotency checks remain effective.

## Apply backpressure across the workflow

Queues absorb bursts, but they do not create processing capacity. If intake remains faster than completion, queue depth and user waiting time grow without bound. Monitor arrival rate, completion rate, stage latency, retry volume, and age of the oldest ready job.

Worker concurrency should respect the bottleneck. Increasing consumers can overload the database or an extraction dependency. Prefetch should be bounded so one worker does not reserve more jobs than it can complete promptly. Separate queues may be appropriate when one slow document class blocks ordinary work, but each queue adds operational policy.

At intake, enforce size and type limits before durable acceptance. When backlog crosses an owned threshold, the system may need to reject new work, apply per-tenant quotas, or communicate a longer delay. Silent unlimited acceptance is not resilience.

The response-shaping principles in [Reducing API Payloads with Response Shaping and Compression](/writings/reducing-api-payloads) also apply to status endpoints: return the stage, public outcome, and useful timestamps, not the complete internal job record.

## Test the failure boundaries

Unit tests can cover error classification, backoff calculation, state-transition rules, and message-version validation. Integration tests should include the real broker and database boundaries for acknowledgement, redelivery, uniqueness, and transaction behavior.

Exercise a crash after the external work but before acknowledgement. Deliver the same message twice concurrently. Make publishing fail after the intake transaction and verify that the outbox recovers it. Exhaust retries and confirm one dead-letter outcome. Redrive the item and prove that completed stage output is not duplicated.

Also test privacy boundaries. Messages, status responses, metrics, and logs should omit document bodies, credentials, unrestricted storage locations, and confidential extracted values. Synthetic documents make these checks safer and reproducible.

## An asynchronous-processing checklist

Before releasing a workflow, confirm:

- The document is durable before work is reported as accepted.
- Job and message identifiers are opaque, stable, and non-sensitive.
- Database and publish consistency has a recovery mechanism.
- Every stage has explicit inputs, outcomes, and allowed transitions.
- Workers expect redelivery and make side effects idempotent.
- Acknowledgement follows durable stage completion.
- Errors are classified into retryable and terminal outcomes.
- Retries use jittered backoff, a cap, and a finite stopping rule.
- Dead-letter items have retention, monitoring, ownership, and controlled redrive.
- Queue depth, job age, retry rate, and dependency load are observable.
- Concurrency and prefetch respect downstream capacity.
- Tests cover crash windows, duplicates, outages, exhaustion, and privacy.

## Conclusion

Reliable asynchronous document processing is not defined by placing work on a queue. It is defined by durable intake, explicit state transitions, idempotent stages, bounded retry policy, and an operator-owned path for unresolved failure. At-least-once delivery becomes manageable when duplicates are expected rather than treated as anomalies.

RabbitMQ or another broker can carry the messages, but correctness lives in the contracts around it: what has been accepted, what can run twice, what should wait, what must stop, and how a human can recover work safely. Those decisions turn background processing from a collection of workers into an operable system.
