select 
    t.Tag_ID,
    t.nazwa_tagu as name,
    k.Kolor_nazwa
From Tag t
    join Kolory k on k.Kolor_ID = t.Kolor_ID