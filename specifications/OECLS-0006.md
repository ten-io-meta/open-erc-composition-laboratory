# OECLS-0006

# Protocol Adapter Specification

Status: Draft

Version: 0.1

---

# Title

Protocol Adapter Specification

---

# Purpose

This specification defines how any Ethereum protocol integrates with the Open ERC Composition Laboratory (OECLS).

Protocols are connected through adapters.

The laboratory never depends on protocol-specific implementations.

---

# Design Principles

Protocol adapters shall be:

- deterministic
- modular
- replaceable
- protocol independent
- versioned

---

# Adapter Responsibilities

Every adapter is responsible for:

- exposing protocol state
- exposing protocol actions
- exposing protocol events
- exposing protocol metadata

The adapter does not modify protocol logic.

---

# Protocol Metadata

Every adapter publishes:

- protocol name
- protocol version
- specification reference
- implementation version

Example:

Protocol:
ERC-8004

Version:
0.4

---

# Observable State

The adapter exposes all measurable protocol state required by experiments.

Examples:

- balances
- reservations
- workflow state
- authority state
- cursors
- identities

The laboratory does not define which variables exist.

Each protocol exposes its own.

---

# Observable Actions

Examples include:

- create
- reserve
- release
- execute
- settle
- cancel

The adapter only exposes actions.

Business logic remains inside the protocol.

---

# Observable Events

Examples:

- ReservationCreated
- ReservationReleased
- WorkflowCompleted
- SettlementExecuted

Events are recorded by experiments.

---

# Compatibility

Multiple adapter versions may coexist.

Experiments always record the adapter version used.

---

# Extensibility

Adapters may expose additional protocol-specific information.

The laboratory remains compatible without modification.

---

# Summary

The Protocol Adapter Specification separates laboratory infrastructure from protocol implementation, allowing any ERC or Ethereum protocol to participate in experiments through a common integration model.