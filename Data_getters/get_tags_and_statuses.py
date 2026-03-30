from Data_getters.MSSQL import MSSQL
import json
import pandas as pd


def get_tag_list():
    sql = MSSQL()
    sql.connect_db()

    fd = open(r'/home/wiktor/Dokumenty/Programowanie/Machina/Data_getters/sqlki/tag.sql', 'r')
    sqlFile = fd.read()
    fd.close()

    output = sql.run_query(sqlFile)

    tags = []

    for _, row in output.iterrows():
        tags.append({
            "id":          int(row['Tag_ID']),
            "name":       row['name'],
            "color": row['Kolor_nazwa'],
        })
    return tags # (json.dumps(tags, ensure_ascii=False, indent=2))

def get_status_list():
    sql = MSSQL()
    sql.connect_db()

    fd = open(r'/home/wiktor/Dokumenty/Programowanie/Machina/Data_getters/sqlki/status.sql', 'r')
    sqlFile = fd.read()
    fd.close()

    output = sql.run_query(sqlFile)

    status = []

    for _, row in output.iterrows():
        status.append({
            "id":          int(row['Status_ID']),
            "name":       row['Status_Nazwa'],
        })
    return status#(json.dumps(status, ensure_ascii=False, indent=2))

