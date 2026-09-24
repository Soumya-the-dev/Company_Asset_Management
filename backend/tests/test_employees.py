def test_create_employee(client):
    payload = {
        "employee_code": "EMP001",
        "name": "Alice Johnson",
        "email": "alice@company.com",
        "department": "Engineering",
        "designation": "Software Engineer",
    }
    response = client.post("/api/employees", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["id"] is not None
    assert data["employee_code"] == "EMP001"
    assert data["name"] == "Alice Johnson"
    assert data["email"] == "alice@company.com"


def test_create_employee_duplicates(client):
    payload = {
        "employee_code": "EMP002",
        "name": "Bob Smith",
        "email": "bob@company.com",
    }
    res1 = client.post("/api/employees", json=payload)
    assert res1.status_code == 201

    # Duplicate code
    dup_code = {
        "employee_code": "EMP002",
        "name": "Bob Another",
        "email": "bob2@company.com",
    }
    assert client.post("/api/employees", json=dup_code).status_code == 409

    # Duplicate email
    dup_email = {
        "employee_code": "EMP003",
        "name": "Bob Smith",
        "email": "bob@company.com",
    }
    assert client.post("/api/employees", json=dup_email).status_code == 409


def test_get_and_search_employees(client):
    client.post("/api/employees", json={"employee_code": "E1", "name": "Charlie Brown", "email": "charlie@company.com", "department": "Design"})
    client.post("/api/employees", json={"employee_code": "E2", "name": "David Miller", "email": "david@company.com", "department": "HR"})

    all_res = client.get("/api/employees")
    assert len(all_res.json()) == 2

    search_res = client.get("/api/employees?search=Charlie")
    assert len(search_res.json()) == 1
    assert search_res.json()[0]["name"] == "Charlie Brown"

    dept_res = client.get("/api/employees?department=HR")
    assert len(dept_res.json()) == 1
    assert dept_res.json()[0]["employee_code"] == "E2"


def test_update_and_delete_employee(client):
    emp = client.post("/api/employees", json={"employee_code": "E3", "name": "Eve Adams", "email": "eve@company.com"}).json()
    emp_id = emp["id"]

    # Update
    update_res = client.put(f"/api/employees/{emp_id}", json={"department": "Security"})
    assert update_res.status_code == 200
    assert update_res.json()["department"] == "Security"

    # Delete
    del_res = client.delete(f"/api/employees/{emp_id}")
    assert del_res.status_code == 204

    # 404
    assert client.get(f"/api/employees/{emp_id}").status_code == 404
