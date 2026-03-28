import pyodbc
import configparser
import logging
import pandas as pd

#config parse to read it 
config = configparser.ConfigParser()
config.sections()
config.read(r'/home/wiktor/Dokumenty/Programowanie/Machina/.config')

logging.basicConfig(
    level=logging.INFO,  # Set the log level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
    format='%(asctime)s - %(levelname)s - %(message)s',  # Log format with timestamp
    handlers=[logging.FileHandler('Main.log'), logging.StreamHandler()]  # Save to file and print to console
)



class MSSQL():
    def __init__(self):
        self.driver = config['MSSQL']['driver']
        self.server = config['MSSQL']['server']
        self.database = config['MSSQL']['database']
        self.username = config['MSSQL']['username']
        self.password = config['MSSQL']['password']

    def connect_db(self):
        try:
            connection = pyodbc.connect('DRIVER=' + self.driver + ';SERVER=' + self.server + ';PORT=1433;DATABASE=' + self.database + ';UID=' + self.username + ';PWD=' + self.password + ';TrustServerCertificate=yes;')
            self.cursor = connection.cursor()
            logging.info('MSSQL Connected')

        except Exception as e:
            logging.error(f'MSSQL not Connected with {e}')

    def run_query(self, query:str):
        return pd.read_sql(query, self.cursor.connection)

if __name__ == '__main__':
    sql = MSSQL()
    sql.connect_db()