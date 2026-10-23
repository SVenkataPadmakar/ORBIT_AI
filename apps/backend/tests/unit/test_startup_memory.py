"""
Unit tests for Startup Memory Layer: ChromaDB Vector Store, Hybrid Embeddings,
Multi-Vault Indexing, and Semantic Search.
"""
import uuid

import pytest
from app.services.vector_store import FastDeterministicEmbedding, VectorStoreManager


def test_hybrid_embedding_normalization_and_dimension() -> None:
    embed_fn = FastDeterministicEmbedding(dim=384)
    docs = [
        "PostgreSQL transactional guarantees and ACID relational schema",
        "Frontend Next.js dynamic routing with sub-50ms latency",
        "",
    ]
    vectors = embed_fn(docs)
    assert len(vectors) == 3
    assert len(vectors[0]) == 384
    assert len(vectors[1]) == 384

    # Verify L2 unit-sphere normalization: sum(v^2) ~= 1.0
    norm_sq_0 = sum(x * x for x in vectors[0])
    norm_sq_1 = sum(x * x for x in vectors[1])
    assert pytest.approx(norm_sq_0, rel=1e-2) == 1.0
    assert pytest.approx(norm_sq_1, rel=1e-2) == 1.0


def test_vector_store_upsert_query_and_filtering(tmp_path) -> None:
    # Use isolated temp directory for ChromaDB
    vs = VectorStoreManager(persist_dir=tmp_path / "test_chroma")
    project_id = uuid.uuid4()

    docs = [
        "DECISION: Use PostgreSQL database instead of DynamoDB for relational consistency.",
        "SPECIFICATION: User authentication requires stateless JWT tokens with Argon2 hashing.",
        "DIRECTIVE: Never deploy code without automated unit and integration tests passing.",
        "MARKET: Total Addressable Market calculated at $4.2B with 18.5% annual CAGR.",
    ]
    metas = [
        {"vault_type": "decision", "title": "Database Choice", "category": "technical", "tags": "db,sql"},
        {"vault_type": "technical", "title": "Auth Contract", "category": "security", "tags": "jwt,auth"},
        {"vault_type": "user", "title": "Test Gate Invariant", "category": "rules", "tags": "quality"},
        {"vault_type": "artifact", "title": "TAM Report", "category": "market", "tags": "tam,market"},
    ]
    ids = ["doc_1", "doc_2", "doc_3", "doc_4"]

    count = vs.upsert_documents(project_id, docs, metas, ids)
    assert count == 4

    # 1. Query with semantic topic
    results = vs.query_similar(project_id, query="What database did we choose and why?", top_k=2)
    assert len(results) > 0
    top = results[0]
    assert top["vault_type"] == "decision"
    assert "PostgreSQL" in top["text"]
    assert top["similarity_score"] > 0.4

    # 2. Query with vault filtering
    auth_results = vs.query_similar(project_id, query="JWT security", vault_type="technical", top_k=5)
    assert len(auth_results) == 1
    assert auth_results[0]["vault_type"] == "technical"
    assert "JWT" in auth_results[0]["text"]

    # 3. Collection statistics
    stats = vs.get_collection_stats(project_id)
    assert stats["total_chunks"] == 4
    assert stats["vault_distribution"]["decision"] == 1
    assert stats["vault_distribution"]["technical"] == 1
    assert stats["vault_distribution"]["user"] == 1
    assert stats["vault_distribution"]["artifact"] == 1

    # 4. Deletion
    del_ok = vs.delete_document(project_id, "doc_4")
    assert del_ok is True
    updated_stats = vs.get_collection_stats(project_id)
    assert updated_stats["total_chunks"] == 3
