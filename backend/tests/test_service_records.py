def test_service_record_lifecycle(client):
    asset = client.post("/api/assets", json={"asset_tag": "SRV-ASSET-1", "asset_type": "Printer"}).json()
    asset_id = asset["id"]

    # Create service record
    payload = {
        "asset_id": asset_id,
        "service_type": "Paper Jam & Roller Replacement",
        "description": "Feed roller needs replacement",
        "service_date": "2026-02-10",
        "service_provider": "HP Authorized Care",
        "cost": 150.00,
        "status": "OPEN",
    }
    create_res = client.post("/api/service-records", json=payload)
    assert create_res.status_code == 201
    record = create_res.json()
    assert record["id"] is not None
    assert record["status"] == "OPEN"

    # Asset status should now be 'In Repair'
    asset_check = client.get(f"/api/assets/{asset_id}").json()
    assert asset_check["status"] == "In Repair"

    # Update service record to COMPLETED
    update_res = client.put(
        f"/api/service-records/{record['id']}",
        json={"status": "COMPLETED", "completed_date": "2026-02-12"},
        params={"return_asset_to_available": True},
    )
    assert update_res.status_code == 200
    assert update_res.json()["status"] == "COMPLETED"

    # Asset status should be back to 'Available'
    asset_after = client.get(f"/api/assets/{asset_id}").json()
    assert asset_after["status"] == "Available"
