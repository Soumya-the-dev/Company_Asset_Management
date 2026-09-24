def test_admin_login(client):
    response = client.post(
        "/api/auth/login",
        json={
            "identifier": "admin@company.com",
            "password": "admin123",
            "preferred_role": "admin",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["role"] == "admin"
    assert data["email"] == "admin@company.com"
    assert "token" in data


def test_employee_register_and_login(client):
    # Register employee
    reg_response = client.post(
        "/api/auth/register",
        json={
            "name": "Kavita Sen",
            "email": "kavita.sen@company.com",
            "department": "Engineering",
            "designation": "Frontend Specialist",
            "employee_code": "EMP-9099",
            "password": "password123",
        },
    )
    assert reg_response.status_code == 201
    reg_data = reg_response.json()
    assert reg_data["role"] == "employee"
    assert reg_data["employee_code"] == "EMP-9099"

    # Login as this new employee
    login_response = client.post(
        "/api/auth/login",
        json={
            "identifier": "EMP-9099",
            "password": "password123",
            "preferred_role": "employee",
        },
    )
    assert login_response.status_code == 200
    login_data = login_response.json()
    assert login_data["name"] == "Kavita Sen"
    assert login_data["role"] == "employee"


def test_employee_login_invalid_credentials(client):
    response = client.post(
        "/api/auth/login",
        json={
            "identifier": "NON-EXISTENT-ID",
            "password": "password123",
            "preferred_role": "employee",
        },
    )
    assert response.status_code == 401
