SELECT distinct
    z.Zadanie_ID,
    z.Tytul_Zadania,
    z.Data_do,
    z.Status_ID,
    
    --t.nazwa_tagu,
    t.kolor
From Zadanie z
    left join Zadanie_Tag zt on zt.Zadanie_ID = z.Zadanie_ID
    join Tag t on t.Tag_ID = zt.Tag_ID
where 
    Month(cast(z.Data_do as date)) = %Month and
    Year(cast(z.Data_do as date)) = %Year
Order By z.Zadanie_ID, z.Data_do