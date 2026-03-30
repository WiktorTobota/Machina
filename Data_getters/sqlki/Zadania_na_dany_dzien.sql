SELECT distinct
    z.Zadanie_ID,
    z.Tytul_Zadania,
    z.Data_do,
    z.Status_ID,
    
    --t.nazwa_tagu,
    k.kolor_nazwa as kolor
From Zadanie z
    left join Zadanie_Tag zt on zt.Zadanie_ID = z.Zadanie_ID
    join Tag t on t.Tag_ID = zt.Tag_ID
    left join Kolory k on k.Kolor_ID = t.Kolor_id 
where 
    Month(cast(z.Data_do as date)) = 3 and
    Year(cast(z.Data_do as date)) = 2026
Order By z.Zadanie_ID, z.Data_do

