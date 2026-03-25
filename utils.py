import datetime

def get_current_date_dict():
    """Zwraca słownik z obecnym rokiem i miesiącem."""
    now = datetime.datetime.now()
    # Tu robisz całą skomplikowaną logikę
    return {
        'month': now.month - 1,
        'year': now.year,
        'day': now.day
    }