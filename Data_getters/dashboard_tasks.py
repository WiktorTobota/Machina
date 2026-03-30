from Data_getters.MSSQL import MSSQL
import json
import pandas as pd



def get_task_for_dashboard(Year, Month):
    sql = MSSQL()
    sql.connect_db()

    fd = open(r'Machina/Data_getters/sqlki/Zadania na dany dzien.sql', 'r')
    sqlFile = fd.read()
    fd.close()

    sqlFile = sqlFile.replace('%Month', f"'{Month}'")
    sqlFile = sqlFile.replace('%Year', f"'{Year}'")
    #print(sqlFile)
    output = sql.run_query(sqlFile)
    
    tasks = []

    for _, row in output.iterrows():
        tasks.append({
            "id":          int(row['Zadanie_ID']),
            "title":       row['Tytul_Zadania'],
            "dueDate":     row['Data_do'].isoformat() if pd.notna(row['Data_do']) else None,
            "isCompleted": int(row['Status_ID']) == 1,
            "colorVar": row['kolor'],

        })


    return(json.dumps(tasks, ensure_ascii=False, indent=2))


#print(get_data_for_dashboard('2026-03-29'))
    

    
