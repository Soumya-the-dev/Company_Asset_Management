def test_return_request_approval(client):
    asset = client.post("/api/assets", json={"asset_tag": "RR-ASSET-1", "asset_type": "Phone"}).json()
    emp = client.post("/api/employees", json={"employee_code": "RR-EMP-1", "name": "Elena", "email": "elena@co.com"}).json()
    assign = client.post("/api/assignments", json={"asset_id": asset["id"], "employee_id": emp["id"]}).json()

    # Request return
    rr_res = client.post("/api/return-requests", json={
        "asset_id": asset["id"],
        "employee_id": emp["id"],
        "assignment_id": assign["id"],
        "notes": "Upgrading to newer model",
    })
    assert rr_res.status_code == 201
    rr = rr_res.json()
    assert rr["status"] == "PENDING"

    # Asset status is now 'Return Requested'
    asset_rr = client.get(f"/api/assets/{asset['id']}").json()
    assert asset_rr["status"] == "Return Requested"

    # Approve return request
    approve_res = client.post(f"/api/return-requests/{rr['id']}/approve?condition_at_return=Excellent")
    assert approve_res.status_code == 200
    assert approve_res.json()["status"] == "APPROVED"

    # Assignment is marked returned
    assign_check = client.get(f"/api/assignments/{assign['id']}").json()
    assert assign_check["returned_at"] is not None
    assert assign_check["condition_at_return"] == "Excellent"

    # Asset is back to Available
    asset_final = client.get(f"/api/assets/{asset['id']}").json()
    assert asset_final["status"] == "Available"


def test_return_request_rejection(client):
    asset = client.post("/api/assets", json={"asset_tag": "RR-ASSET-2", "asset_type": "Tablet"}).json()
    emp = client.post("/api/employees", json={"employee_code": "RR-EMP-2", "name": "Frank", "email": "frank@co.com"}).json()
    assign = client.post("/api/assignments", json={"asset_id": asset["id"], "employee_id": emp["id"]}).json()

    rr = client.post("/api/return-requests", json={
        "asset_id": asset["id"],
        "employee_id": emp["id"],
        "assignment_id": assign["id"],
    }).json()

    # Reject return request
    reject_res = client.post(f"/api/return-requests/{rr['id']}/reject?reason=Project+still+ongoing")
    assert reject_res.status_code == 200
    assert reject_res.json()["status"] == "REJECTED"

    # Asset returns to Assigned
    asset_after = client.get(f"/api/assets/{asset['id']}").json()
    assert asset_after["status"] == "Assigned"
