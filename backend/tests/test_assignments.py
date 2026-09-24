def test_assignment_lifecycle(client):
    # Setup asset and employee
    asset = client.post("/api/assets", json={"asset_tag": "ASSET-ASSIGN-1", "asset_type": "Laptop"}).json()
    emp = client.post("/api/employees", json={"employee_code": "EMP-ASS-1", "name": "Sam", "email": "sam@company.com"}).json()

    # Assign asset
    assign_payload = {
        "asset_id": asset["id"],
        "employee_id": emp["id"],
        "condition_at_assignment": "New in box",
        "notes": "Issued for remote work",
    }
    assign_res = client.post("/api/assignments", json=assign_payload)
    assert assign_res.status_code == 201
    assignment = assign_res.json()
    assert assignment["asset_id"] == asset["id"]
    assert assignment["returned_at"] is None

    # Check asset status became 'Assigned'
    asset_after = client.get(f"/api/assets/{asset['id']}").json()
    assert asset_after["status"] == "Assigned"

    # Try assigning the same asset again -> should fail with 400
    emp2 = client.post("/api/employees", json={"employee_code": "EMP-ASS-2", "name": "Tom", "email": "tom@company.com"}).json()
    dup_assign = client.post("/api/assignments", json={"asset_id": asset["id"], "employee_id": emp2["id"]})
    assert dup_assign.status_code == 400
    assert "cannot be assigned" in dup_assign.json()["detail"]

    # Return asset
    return_res = client.post(
        f"/api/assignments/{assignment['id']}/return",
        json={"condition_at_return": "Good", "notes": "No scratches"},
    )
    assert return_res.status_code == 200
    returned_data = return_res.json()
    assert returned_data["returned_at"] is not None

    # Check asset status is back to 'Available'
    asset_returned = client.get(f"/api/assets/{asset['id']}").json()
    assert asset_returned["status"] == "Available"

    # Returning again should fail with 400
    dup_return = client.post(f"/api/assignments/{assignment['id']}/return", json={})
    assert dup_return.status_code == 400


def test_assignment_filters(client):
    asset1 = client.post("/api/assets", json={"asset_tag": "A-FLT-1", "asset_type": "Monitor"}).json()
    asset2 = client.post("/api/assets", json={"asset_tag": "A-FLT-2", "asset_type": "Keyboard"}).json()
    emp = client.post("/api/employees", json={"employee_code": "E-FLT", "name": "Filter User", "email": "flt@co.com"}).json()

    a1 = client.post("/api/assignments", json={"asset_id": asset1["id"], "employee_id": emp["id"]}).json()
    a2 = client.post("/api/assignments", json={"asset_id": asset2["id"], "employee_id": emp["id"]}).json()

    # Return first
    client.post(f"/api/assignments/{a1['id']}/return", json={})

    # Active only should return only 1
    active_res = client.get("/api/assignments?active_only=true")
    assert len(active_res.json()) == 1
    assert active_res.json()[0]["id"] == a2["id"]
