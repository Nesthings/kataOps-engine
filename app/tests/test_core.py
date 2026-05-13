from app.katas.core import Dictionary, get_total, nth_char

def test_dictionary():
    d = Dictionary()
    d.newentry('Apple', 'A fruit that grows on trees')
    assert d.look('Apple') == 'A fruit that grows on trees'
    assert d.look('Banana') == "Can't find any entry for Banana"


def test_get_total():
    costs = {'socks': 5, 'shoes' : 60, 'sweater': 30}
    # Verifies that 60 + 5 + taxes is: 70.85
    assert get_total(costs, ['socks', 'shoes'], 0.09) == 70.85
    # Verifies that the non-existent items get ignored
    assert get_total(costs, ['socks', 'shoes', 'hat'], 0.09) == 70.85


def test_nth_char():
    assert nth_char(["yoda", "best", "has"]) == "yes"
    assert nth_char([]) == ""

    
