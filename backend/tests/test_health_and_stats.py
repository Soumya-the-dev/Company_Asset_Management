def test_root_endpoint(client):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert data["message"] == "Company Asset Management API is running"
    assert "docs" in data


def test_health_endpoint(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "timestamp" in data


def test_stats_endpoint_empty(client):
    response = client.get("/api/stats")
    assert response.status_code == 200
    data = response.json()
    assert data["total_assets"] == 0
    assert data["available_assets"] == 0
    assert data["assigned_assets"] == 0
    assert data["total_employees"] == 0
    assert data["active_assignments"] == 0
