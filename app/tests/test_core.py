from app.katas.core import get_total, nth_char


def test_get_total():
    costs = {'socks': 5, 'shoes': 60, 'sweater': 30}
    assert get_total(costs, ['socks', 'shoes'], 0.09) == 70.85
    assert get_total(costs, ['socks', 'shoes', 'hat'], 0.09) == 70.85


def test_nth_char():
    assert nth_char(["yoda", "best", "has"]) == "yes"
    assert nth_char([]) == ""


# --- API tests ---

def test_health(client):
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_add_entry(client):
    r = client.post("/api/v1/dictionary/add", json={"word": "Apple", "definition": "A fruit"})
    assert r.status_code == 200
    assert "Apple" in r.json()["message"]


def test_add_duplicate_entry(client):
    payload = {"word": "Apple", "definition": "A fruit"}
    client.post("/api/v1/dictionary/add", json=payload)
    r = client.post("/api/v1/dictionary/add", json=payload)
    assert r.status_code == 400


def test_look_existing_entry(client):
    client.post("/api/v1/dictionary/add", json={"word": "Apple", "definition": "A fruit"})
    r = client.get("/api/v1/dictionary/look/Apple")
    assert r.status_code == 200
    data = r.json()
    assert data["word"] == "Apple"
    assert data["definition"] == "A fruit"
    assert "metadata" in data


def test_look_missing_entry(client):
    r = client.get("/api/v1/dictionary/look/Banana")
    assert r.status_code == 404


def test_get_all_entries(client):
    client.post("/api/v1/dictionary/add", json={"word": "Apple", "definition": "A fruit"})
    r = client.get("/api/v1/dictionary/all")
    assert r.status_code == 200
    dictionary = r.json()["dictionary"]
    assert "Apple" in dictionary
    assert dictionary["Apple"]["definition"] == "A fruit"


def test_calculate_total(client):
    r = client.post("/api/v1/costs/calculate", json={
        "costs": {"socks": 5, "shoes": 60},
        "items": ["socks", "shoes"],
        "tax": 0.09,
    })
    assert r.status_code == 200
    assert r.json()["total_cost"] == 70.85


def test_concat_nth_char(client):
    r = client.post("/api/v1/strings/concat", json={"words": ["yoda", "best", "has"]})
    assert r.status_code == 200
    assert r.json()["result"] == "yes"


def test_concat_short_word(client):
    # "ab" has no index 2, nth_char raises IndexError → 400
    r = client.post("/api/v1/strings/concat", json={"words": ["yoda", "best", "ab"]})
    assert r.status_code == 400
