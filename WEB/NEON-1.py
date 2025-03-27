import os
import logging
import psycopg2

# ----------------------------------------------------------------------------
# CONSTANTS
# ----------------------------------------------------------------------------

LOG_DIRECTORY = r"C:\Users\ARYAVIN\Documents\REPO\STARTUP\WEB\log"
LOG_FILENAME = "NEON1.log"

DATABASE_URL = 'postgresql://neondb_owner:npg_asGvitg0PxV5@ep-shy-boat-a8x7deyi-pooler.eastus2.azure.neon.tech/neondb?sslmode=require'

# ----------------------------------------------------------------------------
# LOGGING SETUP
# ----------------------------------------------------------------------------

def setup_logging():
    try:
        os.makedirs(LOG_DIRECTORY, exist_ok=True)
        logging.basicConfig(
            level=logging.DEBUG,
            format='%(asctime)s - %(levelname)s - %(message)s',
            filename=os.path.join(LOG_DIRECTORY, LOG_FILENAME),
            filemode='w'
        )
        logging.debug("Logging setup completed.")
    except Exception as e:
        print(f"Failed to setup logging: {e}")
        raise

# ----------------------------------------------------------------------------
# FETCH DETAILS OF ALL USERS
# ----------------------------------------------------------------------------

def fetch_all_users():
    try:
        logging.debug("Connecting to Neon PostgreSQL...")
        with psycopg2.connect(DATABASE_URL) as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT id, name, email, age, location, interests FROM users;")
                users = cur.fetchall()

                if users:
                    print("\n--- User Details ---")
                    logging.info("--- User Details ---")
                    for user in users:
                        user_info = f"ID: {user[0]}, Name: {user[1]}, Email: {user[2]}, Age: {user[3]}, Location: {user[4]}, Interests: {user[5]}"
                        print(user_info)
                        logging.info(user_info)
                else:
                    print("No users found in the database.")
                    logging.info("No users found in the database.")
    except Exception as e:
        error_msg = f"Error while fetching users: {e}"
        print(error_msg)
        logging.error(error_msg)

# ----------------------------------------------------------------------------
# MAIN
# ----------------------------------------------------------------------------

if __name__ == "__main__":
    setup_logging()
    logging.info("Script started.")
    fetch_all_users()
    logging.info("Script completed.")
