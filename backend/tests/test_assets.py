def test_create_asset_minimal(client):
    payload = {
        "asset_tag": "TAG-101",
        "asset_type": "Laptop",
        "manufacturer": "Apple",
        "model": "MacBook Air",
    }
    response = client.post("/api/assets", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["id"] is not None
    assert data["asset_tag"] == "TAG-101"
    assert data["name"] == "Apple MacBook Air"
    assert data["status"] == "Available"
    assert data["asset_type"] == "Laptop"


def test_create_asset_full(client):
    payload = {
        "asset_tag": "TAG-102",
        "name": "Dell Precision Workstation",
        "asset_type": "Workstation",
        "category": "Hardware",
        "manufacturer": "Dell",
        "model": "Precision 5570",
        "serial_number": "SN-987654",
        "specifications": "i9, 64GB RAM, 2TB SSD",
        "purchase_date": "2026-01-15",
        "purchase_cost": 2499.99,
        "status": "Available",
    }
    response = client.post("/api/assets", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["asset_tag"] == "TAG-102"
    assert data["serial_number"] == "SN-987654"
    assert data["purchase_cost"] == 2499.99
    assert data["description"] == "i9, 64GB RAM, 2TB SSD"
    assert data["specifications"] == "i9, 64GB RAM, 2TB SSD"


def test_create_asset_duplicate_tag(client):
    payload = {
        "asset_tag": "TAG-DUP",
        "asset_type": "Monitor",
    }
    res1 = client.post("/api/assets", json=payload)
    assert res1.status_code == 201

    res2 = client.post("/api/assets", json=payload)
    assert res2.status_code == 409
    assert "already exists" in res2.json()["detail"]


def test_create_asset_duplicate_serial(client):
    p1 = {
        "asset_tag": "TAG-A",
        "asset_type": "Phone",
        "serial_number": "SN-UNIQUE-1",
    }
    p2 = {
        "asset_tag": "TAG-B",
        "asset_type": "Phone",
        "serial_number": "SN-UNIQUE-1",
    }
    assert client.post("/api/assets", json=p1).status_code == 201
    res2 = client.post("/api/assets", json=p2)
    assert res2.status_code == 409


def test_get_assets_and_filters(client):
    client.post("/api/assets", json={"asset_tag": "LAP-1", "asset_type": "Laptop", "category": "IT", "status": "Available"})
    client.post("/api/assets", json={"asset_tag": "LAP-2", "asset_type": "Laptop", "category": "IT", "status": "In Repair"})
    client.post("/api/assets", json={"asset_tag": "MON-1", "asset_type": "Monitor", "category": "Office", "status": "Available"})

    # All assets
    all_res = client.get("/api/assets")
    assert len(all_res.json()) == 3

    # Filter by status
    repair_res = client.get("/api/assets?status=In Repair")
    assert len(repair_res.json()) == 1
    assert repair_res.json()[0]["asset_tag"] == "LAP-2"

    # Filter by asset_type
    mon_res = client.get("/api/assets?asset_type=Monitor")
    assert len(mon_res.json()) == 1
    assert mon_res.json()[0]["asset_tag"] == "MON-1"

    # Search
    search_res = client.get("/api/assets?search=LAP-1")
    assert len(search_res.json()) == 1
    assert search_res.json()[0]["asset_tag"] == "LAP-1"


def test_get_asset_by_id(client):
    created = client.post("/api/assets", json={"asset_tag": "TAG-LOOKUP", "asset_type": "Keyboard"}).json()
    asset_id = created["id"]

    res = client.get(f"/api/assets/{asset_id}")
    assert res.status_code == 200
    assert res.json()["asset_tag"] == "TAG-LOOKUP"

    res_404 = client.get("/api/assets/999999")
    assert res_404.status_code == 404


def test_update_asset_and_history(client):
    created = client.post(
        "/api/assets",
        json={"asset_tag": "TAG-HIST", "name": "Initial Name", "asset_type": "Tablet", "status": "Available"}
    ).json()
    asset_id = created["id"]

    # Initial history entry
    hist1 = client.get(f"/api/assets/{asset_id}/history")
    assert hist1.status_code == 200
    assert len(hist1.json()) == 1
    assert hist1.json()[0]["new_status"] == "Available"

    # Update status to Retired
    update_res = client.put(f"/api/assets/{asset_id}", json={"status": "Retired", "name": "Updated Tablet"})
    assert update_res.status_code == 200
    assert update_res.json()["status"] == "Retired"
    assert update_res.json()["name"] == "Updated Tablet"

    # History should have 2 entries
    hist2 = client.get(f"/api/assets/{asset_id}/history")
    assert len(hist2.json()) == 2
    assert hist2.json()[0]["new_status"] == "Retired"
    assert hist2.json()[0]["old_status"] == "Available"


def test_delete_asset(client):
    created = client.post("/api/assets", json={"asset_tag": "TAG-DEL", "asset_type": "Mouse"}).json()
    asset_id = created["id"]

    del_res = client.delete(f"/api/assets/{asset_id}")
    assert del_res.status_code == 204

    get_res = client.get(f"/api/assets/{asset_id}")
    assert get_res.status_code == 404
