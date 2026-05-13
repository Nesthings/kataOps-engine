# Kata 1: Dictionary

class Dictionary:
    def __init__(self):
        self.entries = {}

    def newentry(self, word: str, definition: str):
        self.entries[word] = definition    

    def look(self, word: str) -> str:
        return self.entries.get(word, f"Can't find any entry for {word}")


# Kata 2: Costs calculator

def get_total(costs: dict, items: list, tax: float) -> float:
    total_cost = 0.0
    for item in items:
        if item in costs:
            total_cost += costs[item]

    total_with_tax = total_cost + (total_cost * tax)
    return round(total_with_tax, 2)


# Kata 3: Strings concatenator

def nth_char(words: list) -> str:
    if not words:
        return ""
    
    result = ""

    for i, word in enumerate(words):
        result += word[i]

    return result     
